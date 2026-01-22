"use server";

import { createPublicAction } from "@/middlewares/actions/action-factory";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/mail";
import { cookies } from "next/headers";
import { createToken } from "@/lib/auth";
import { getConflictingBookings } from "@/lib/cache";

export async function createBookingAction(data: any) {
    return createPublicAction(
        "CreateBooking",
        async (body: any) => {
            const { email, firstName, lastName, phone, drivingLicense, nif, ...bookingData } = body;

            if (!email) throw new Error("Email é obrigatório");

            // 1. Verificar se o usuário já existe
            const { data: user, error: userError } = await supabaseAdmin
                .from("users")
                .select("*")
                .eq("email", email.toLowerCase())
                .maybeSingle();

            let currentUser = user;
            let userCreated = false;

            if (!user) {
                // 2. Criar usuário se não existir
                const { data: newUser, error: createError } = await supabaseAdmin
                    .from("users")
                    .insert([{
                        email: email.toLowerCase(),
                        full_name: `${firstName} ${lastName}`.trim(),
                        phone,
                        nif,
                        license_number: drivingLicense,
                        created_at: new Date().toISOString(),
                        role: 'CLIENT',
                        is_active: true
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                currentUser = newUser;
                userCreated = true;
            } else {
                // Se o usuário existe, atualizamos os seus dados se fornecidos no formulário
                const updates: any = {};
                const fullName = `${firstName} ${lastName}`.trim();

                if (fullName) updates.full_name = fullName;
                if (phone) updates.phone = phone;
                if (nif) updates.nif = nif;
                if (drivingLicense) updates.license_number = drivingLicense;

                if (Object.keys(updates).length > 0) {
                    await supabaseAdmin
                        .from("users")
                        .update(updates)
                        .eq("id", user.id);
                    currentUser = { ...user, ...updates };
                }
            }

            // 3. Buscar informações dos veículos (para associar partner_id, vehicle_id e driver default)
            const carIds = body.carIds || [];
            const { data: vehiclesData } = await supabaseAdmin
                .from("vehicles")
                .select("id, partner_id, current_driver_id")
                .in("id", carIds);

            const mainVehicle = vehiclesData?.[0];

            // 3.5 Buscar dados adicionais do parceiro para Rentais
            const isRental = (bookingData.searchContext?.type || body.searchContext?.type || body.type || "rental") === "rental";
            let partnerAddress = null;
            if (isRental && mainVehicle?.partner_id) {
                const { data: partnerData } = await supabaseAdmin
                    .from("partners")
                    .select("address_street, address_city, address_province")
                    .eq("id", mainVehicle.partner_id)
                    .single();
                if (partnerData) {
                    partnerAddress = `${partnerData.address_street}, ${partnerData.address_city}, ${partnerData.address_province}`;
                }
            }

            // Normalize search context from multiple possible sources (drafts, forms, url params)
            const ctx = bookingData.search || bookingData.searchContext || bookingData.searchState || body.search || body.searchContext || body.searchState || bookingData || {};

            const pickupAddress =
                ctx?.pickup || ctx?.pickup_address || bookingData.pickup || body.pickup || null;

            // For rentals, prefer partner address as dropoff if user didn't specify dropoff
            const rawDropoff = ctx?.dropoff || ctx?.dropoff_address || bookingData.dropoff || body.dropoff || null;
            const dropoffAddress = isRental ? (rawDropoff || partnerAddress || null) : rawDropoff;

            const startTime = ctx?.from || ctx?.date || bookingData.from || bookingData.start_time || body.from || body.start_time || new Date().toISOString();
            const endTime = ctx?.to || ctx?.date || bookingData.to || bookingData.end_time || body.to || body.end_time || null;

            // 4. Criar reserva com campos mapeados corretamente para o schema
            const { data: newBooking, error: bookingError } = await supabaseAdmin
                .from("bookings")
                .insert([{
                    code: `WT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    client_id: currentUser.id,
                    vehicle_id: mainVehicle?.id || null,
                    partner_id: mainVehicle?.partner_id || null,
                    driver_id: mainVehicle?.current_driver_id || null,
                    service_type: isRental ? "rental" : "transfer",
                    pickup_address: pickupAddress || "N/A",
                    dropoff_address: dropoffAddress || null,
                    start_time: startTime,
                    end_time: endTime,
                    total_price: body.totalAmount || body.total_price || 0,
                    currency: 'AOA',
                    status: "pending",
                    stops: ctx?.stops || bookingData.stops || body.stops || null,
                    created_at: new Date().toISOString(),
                }])
                .select()
                .single();

            if (bookingError) throw bookingError;

            // 4.0 Check for Waitlist necessity
            const busyIds = await getConflictingBookings(startTime, endTime || new Date(new Date(startTime).getTime() + 4 * 3600000).toISOString());
            const isWaitlist = mainVehicle?.id && busyIds.includes(mainVehicle.id);

            if (isWaitlist && newBooking) {
                console.log(`⏳ Booking ${newBooking.id} is for a busy vehicle. Adding to waitlist.`);
                await supabaseAdmin
                    .from("booking_waitlist")
                    .insert([{
                        booking_id: newBooking.id,
                        original_partner_id: mainVehicle.partner_id,
                        original_vehicle_id: mainVehicle.id,
                        original_driver_id: mainVehicle.current_driver_id,
                        service_type: isRental ? "rental" : "transfer",
                        status: "waiting",
                        reason: "User selected busy vehicle (Waitlist)",
                        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h for user waitlists
                        created_at: new Date().toISOString()
                    }]);

                // Also update booking status to potentially a 'waitlist' variant if recognized, 
                // but keeping 'pending' for now as per schema constraints
            }

            // 4.1 Registar Transação (Simulação Pagamento)
            if (newBooking && body.totalAmount) {
                await supabaseAdmin.from("transactions").insert({
                    booking_id: newBooking.id,
                    partner_id: newBooking.partner_id,
                    amount: body.totalAmount,
                    type: "payment",
                    description: `Pagamento Reserva ${newBooking.code}`,
                    created_at: new Date().toISOString()
                });
            }

            // 4. Enviar email de confirmação
            try {
                await sendEmail({
                    to: email,
                    subject: `Confirmação de Reserva #${newBooking.id} - WiTransfer`,
                    template: "booking_confirmation" as any,
                    templateData: {
                        bookingId: newBooking.id,
                        customerName: `${firstName} ${lastName}`,
                        booking: { ...newBooking, customerEmail: email },
                        userCreated
                    }
                });
            } catch (emailError) {
                console.error("Erro ao enviar email:", emailError);
            }

            // 5. Login Automático (Set Cookie)
            const token = await createToken({
                id: currentUser.id,
                email: currentUser.email,
                role: currentUser.role || 'CLIENT',
                name: currentUser.full_name
            });

            (await cookies()).set('client_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                path: '/',
                sameSite: "lax",
            });

            return {
                success: true,
                booking: newBooking,
                user: {
                    id: currentUser.id,
                    email: currentUser.email,
                    fullName: currentUser.full_name,
                },
                userCreated,
            };
        },
        data,
    );
}

export async function getUserBookingsAction(email: string) {
    return createPublicAction(
        "GetUserBookings",
        async (emailStr: string) => {
            if (!emailStr) throw new Error("Email é obrigatório");

            const { data: user } = await supabaseAdmin
                .from("users")
                .select("id")
                .eq("email", emailStr.toLowerCase())
                .single();

            if (!user) return [];

            const { data: bookings, error } = await supabaseAdmin
                .from("bookings")
                .select("*, vehicles(*, vehicle_classes(*)), transactions(*)")
                .eq("client_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return bookings;
        },
        email,
    );
}

export async function cancelBookingAction(id: string) {
    return createPublicAction(
        "CancelBooking",
        async (bookingId: string) => {
            if (!bookingId) throw new Error("ID é obrigatório");

            const { error } = await supabaseAdmin
                .from("bookings")
                .update({ status: "cancelled", updated_at: new Date().toISOString() })
                .eq("id", bookingId);

            if (error) throw error;

            return { success: true };
        },
        id,
    );
}

export async function getBookingByIdAction(id: string) {
    return createPublicAction(
        "GetBookingById",
        async (bookingId: string) => {
            if (!bookingId) throw new Error("ID da reserva é obrigatório");

            const { data, error } = await supabaseAdmin
                .from("bookings")
                .select(`
                    *,
                    vehicles(*, vehicle_classes(*), current_driver:users!current_driver_id(id, full_name, phone, avatar_url, license_number)),
                    transactions(*),
                    partners(*),
                    driver:users!driver_id(id, full_name, phone, avatar_url, license_number)
                `)
                .eq("id", bookingId)
                .single();

            if (error) throw error;

            // 1. Se a reserva tem um veículo associado, tentar buscar APENAS os extras permitidos para ele
            if (data.vehicle_id) {
                const { data: vehicle } = await supabaseAdmin
                    .from("vehicles")
                    .select("extras")
                    .eq("id", data.vehicle_id)
                    .single();

                const allowedExtrasIds = (vehicle?.extras && Array.isArray(vehicle.extras)) ? vehicle.extras : [];

                if (allowedExtrasIds.length > 0) {
                    const { data: vehicleExtras } = await supabaseAdmin
                        .from("extras")
                        .select("*")
                        .in("id", allowedExtrasIds);

                    data.available_extras = vehicleExtras || [];
                    return data; // Retorna antecipadamente pois já temos os extras exatos
                }
            }

            // 2. Fallback: Se não buscou por veículo, recupera extras globais + extras do parceiro
            // Aligned with user request: recupera extras globais + extras do parceiro
            if (data && data.partner_id) {
                const { data: extras } = await supabaseAdmin
                    .from("extras")
                    .select("*")
                    .or(`partner_id.is.null,partner_id.eq.${data.partner_id}`);

                data.available_extras = extras || [];
            } else if (data) {
                // Se não tem partner_id, mostra apenas globais
                const { data: extras } = await supabaseAdmin
                    .from("extras")
                    .select("*")
                    .is("partner_id", null);

                data.available_extras = extras || [];
            }

            return data;
        },
        id,
    );
}

export async function resendDigitalReceiptAction(bookingId: string, email: string) {
    return createPublicAction(
        "ResendDigitalReceipt",
        async (id: string) => {
            if (!id) throw new Error("ID é obrigatório");
            if (!email) throw new Error("Email é obrigatório");

            // 1. Buscar detalhes da reserva com veículos e cliente
            const { data: booking, error } = await supabaseAdmin
                .from("bookings")
                .select(`
                    *,
                    vehicles(*),
                    users:client_id(full_name)
                `)
                .eq("id", id)
                .single();

            if (error || !booking) throw new Error("Reserva não encontrada");

            // 2. Enviar email com template de recibo
            await sendEmail({
                to: email,
                subject: `Seu Recibo Digital - Reserva #${booking.code || booking.id.slice(0, 8)} - WiTransfer`,
                template: "digital_receipt" as any,
                templateData: {
                    booking,
                    customerName: (booking.users as any)?.full_name || "Cliente",
                }
            });

            return { success: true };
        },
        bookingId
    );
}
