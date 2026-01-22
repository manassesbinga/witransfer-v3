import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/mail";

// Helper: Find available vehicles with similar attributes
async function findAvailableVehicles(booking: any, excludeVehicleId: string, partnerId?: string) {
  let query = supabaseAdmin
    .from("vehicles")
    .select("*")
    .neq("id", excludeVehicleId)
    .eq("status", "active");

  if (partnerId) {
    query = query.eq("partner_id", partnerId);
  }

  // Se for rental ou transfer, filtrar por disponibilidade
  if (booking.service_type === 'rental') {
    query = query.in("available_for", ["rental", "both"]);
  } else if (booking.service_type === 'transfer') {
    query = query.in("available_for", ["transfer", "both"]);
  }

  const { data: vehicles } = await query.limit(10);
  return vehicles || [];
}

// Helper: Find available drivers
async function findAvailableDrivers(booking: any, excludeDriverId: string, partnerId?: string) {
  let query = supabaseAdmin
    .from("users")
    .select("*")
    .neq("id", excludeDriverId || "")
    .eq("role", "DRIVER")
    .eq("is_active", true);

  if (partnerId) {
    query = query.eq("partner_id", partnerId);
  }

  const { data: drivers } = await query.limit(10);
  return drivers || [];
}

// Helper: Create waitlist entry
async function createWaitlistEntry(booking: any, reason: string) {
  const { data, error } = await supabaseAdmin
    .from("booking_waitlist")
    .insert({
      booking_id: booking.id,
      original_partner_id: booking.partner_id,
      original_driver_id: booking.driver_id,
      original_vehicle_id: booking.vehicle_id,
      service_type: booking.service_type,
      status: "waiting",
      reason: reason,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    })
    .select()
    .single();

  if (error) console.error("Error creating waitlist entry:", error);
  return data;
}

// Helper: Notify client about assignment
async function notifyClientAboutAssignment(bookingId: string) {
  try {
    console.log(`📧 Tentando enviar notificação para booking ${bookingId}...`);
    // 1. Fetch complete data
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        client:users!client_id(*),
        driver:users!driver_id(*),
        vehicle:vehicles!vehicle_id(*),
        partner:partners(*)
      `)
      .eq("id", bookingId)
      .single();

    if (!booking || !booking.client?.email) {
      console.log("⚠️ Dados insuficientes para enviar email (sem cliente ou sem email)");
      return;
    }

    // 2. Send Email
    await sendEmail({
      to: booking.client.email,
      subject: `[WiTransfer] Os detalhes da sua viatura (Reserva #${booking.code || booking.id.slice(0, 8)})`,
      template: "booking_assignment",
      templateData: {
        booking: booking,
        customerName: booking.client.full_name || booking.client.name,
        vehicle: booking.vehicle,
        driver: booking.driver,
        partner: booking.partner
      }
    });

    console.log(`✅ Notificação enviada para o cliente ${booking.client.email}`);
  } catch (err) {
    console.error("❌ Erro ao enviar notificação de atribuição:", err);
  }
}

// Helper: Attempt reassignment
async function attemptReassignment(booking: any, reason: string) {
  try {
    console.log(`🔄 Iniciando reatribuição para booking ${booking.id}...`);

    // 1. Tentar primeiro no mesmo parceiro
    let altVehicles = await findAvailableVehicles(booking, booking.vehicle_id || "", booking.partner_id);
    let altDrivers = await findAvailableDrivers(booking, booking.driver_id || "", booking.partner_id);

    // 2. Se não encontrar no mesmo parceiro, tentar GLOBALMENTE (outros parceiros)
    if (altVehicles.length === 0 || altDrivers.length === 0) {
      console.log(`⚠️ Nenhum recurso disponível no parceiro original (${booking.partner_id}). Tentando busca global...`);
      altVehicles = await findAvailableVehicles(booking, booking.vehicle_id || "");
      altDrivers = await findAvailableDrivers(booking, booking.driver_id || "");
    }

    const altVehicle = altVehicles[0];
    const altDriver = altDrivers[0];

    // Se ambos encontrados, reassign
    if (altVehicle && altDriver) {
      console.log(`✅ Novo recurso encontrado! Veículo: ${altVehicle.id}, Motorista: ${altDriver.id}, Parceiro: ${altVehicle.partner_id}`);

      const { data: reassigned, error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({
          vehicle_id: altVehicle.id,
          driver_id: altDriver.id,
          partner_id: altVehicle.partner_id, // Pode ser um novo parceiro
          status: "pending", // Volta a ficar pendente para o novo condutor/parceiro aceitar se necessário
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id)
        .select()
        .single();

      if (!updateError && reassigned) {
        // Mark waitlist as reassigned if it existed
        await supabaseAdmin
          .from("booking_waitlist")
          .update({ status: "reassigned", reassigned_at: new Date().toISOString() })
          .eq("booking_id", booking.id)
          .eq("status", "waiting");

        // Notify Client (Auto-Reassignment)
        await notifyClientAboutAssignment(booking.id);

        return { success: true, type: "reassigned", data: reassigned };
      }
    }

    // Se não encontrou alternativa, vai para a lista de espera
    console.log(`⏳ Nenhum recurso compatível disponível. Booking ${booking.id} movido para lista de espera.`);
    const waitlistEntry = await createWaitlistEntry(booking, reason);

    // Update booking status to reflect it's waiting for resources
    // CRITICAL: Set partner_id to NULL so it "disappears" from the partner's list and stays only for Admin
    await supabaseAdmin
      .from("bookings")
      .update({
        status: "pending",
        vehicle_id: null,
        driver_id: null,
        partner_id: null, // Move to system-level/Admin
        updated_at: new Date().toISOString()
      })
      .eq("id", booking.id);

    return { success: true, type: "waitlist", data: waitlistEntry };
  } catch (error) {
    console.error("Error during reassignment:", error);
    return { success: false, error };
  }
}

export async function POST(request: Request) {
  try {
    const { action, role, partnerId, data } = await request.json();

    // LOG LOUDER FOR DEBUGGING
    console.error("\n\n################################################");
    console.error(`[CRITICAL_DEBUG] ACTION: ${action}`);
    console.error(`[CRITICAL_DEBUG] ROLE: ${role}`);
    console.error(`[CRITICAL_DEBUG] PARTNER_ID: ${partnerId}`);
    console.error("################################################\n");

    // DEFINITIVE ROLE CHECK: Only these two can see the waitlist. 
    // They are allowed even if linked to a partner.
    const canSeeWaitlist = ["ADMIN", "SUPER_ADMIN"].includes(role);

    if (action === "LIST") {
      let query = supabaseAdmin.from("bookings").select(`
        *,
        client:users!client_id(id, full_name, email, phone),
        driver:users!driver_id(id, full_name, phone),
        vehicle:vehicles!vehicle_id(id, brand, model, license_plate),
        partner:partners(id, name),
        waitlist:booking_waitlist(id, status)
      `);

      // If NOT an admin/super_admin, strictly filter by partner
      if (!canSeeWaitlist) {
        query = query.eq("partner_id", partnerId);
      } else if (data?.partnerId && data.partnerId !== 'all') {
        // Allow Admins to filter by a specific partner
        query = query.eq("partner_id", data.partnerId);
      }

      if (data?.type) {
        query = query.eq("service_type", data.type);
      }

      // Pagination
      const page = data?.page || 1;
      const limit = data?.limit || 1000;
      const offset = (page - 1) * limit;

      const { data: bookings, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
      }

      // DEBUG: Log context
      console.log(`[DEBUG_API] LIST - Role: ${role}, canSeeWaitlist: ${canSeeWaitlist}`);

      // Clean up waitlist structure
      const processedBookings = (bookings || []).map(b => {
        const waitlistArr = Array.isArray(b.waitlist) ? b.waitlist : (b.waitlist ? [b.waitlist] : []);
        const waitlistEntry = waitlistArr[0] || null;
        return {
          ...b,
          waitlistEntry
        };
      });

      // DETERMINISTIC FILTER
      const filteredBookings = canSeeWaitlist
        ? processedBookings
        : processedBookings.filter(b => {
          const isWaiting = b.waitlistEntry?.status === 'waiting';
          if (isWaiting) {
            console.log(`[SECURITY] Hiding waitlist item ${b.id} from role ${role}`);
          }
          return !isWaiting;
        });

      console.log(`[DEBUG_API] Returning ${filteredBookings.length} / ${processedBookings.length}`);
      return NextResponse.json(filteredBookings);
    }

    if (action === "GET_DETAILS") {
      const { id } = data;

      // Primeiro verifica permissão
      const { data: booking, error: fetchError } = await supabaseAdmin
        .from("bookings")
        .select("*, waitlist:booking_waitlist(*)")
        .eq("id", id)
        .single();

      if (fetchError || !booking) {
        return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
      }

      if (!canSeeWaitlist && booking.partner_id !== partnerId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      // Final check: if waitlist is active, only admin can see it
      const waitlistEntry = Array.isArray(booking.waitlist) ? booking.waitlist[0] : (booking.waitlist || null);
      if (!canSeeWaitlist && waitlistEntry?.status === 'waiting') {
        return NextResponse.json({ error: "Reserva em lista de espera. Acesso restrito a administradores." }, { status: 403 });
      }

      // Busca dados relacionados
      const [clientRes, driverRes, vehicleRes, partnerRes] = await Promise.all([
        supabaseAdmin.from("users").select("*").eq("id", booking.client_id).single(),
        supabaseAdmin.from("users").select("*").eq("id", booking.driver_id).single(),
        supabaseAdmin.from("vehicles").select("*").eq("id", booking.vehicle_id).single(),
        supabaseAdmin.from("partners").select("*").eq("id", booking.partner_id).single(),
      ]);

      return NextResponse.json({
        ...booking,
        client: clientRes.data,
        driver: driverRes.data,
        vehicle: vehicleRes.data,
        partner: partnerRes.data,
        waitlistEntry: Array.isArray(booking.waitlist) ? booking.waitlist[0] : (booking.waitlist || null)
      });
    }

    if (action === "UPDATE_STATUS") {
      const { id, status } = data;

      // Primeiro verifica permissão e se está na lista de espera
      const { data: booking, error: fetchError } = await supabaseAdmin
        .from("bookings")
        .select(`
          id, 
          partner_id, 
          waitlist:booking_waitlist(status),
          partner:partners(status)
        `)
        .eq("id", id)
        .single();

      if (fetchError || !booking) {
        return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
      }

      if (!canSeeWaitlist && booking.partner_id !== partnerId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      // Bloqueios de confirmação
      if (status === 'confirmed') {
        const waitlist = Array.isArray(booking.waitlist) ? booking.waitlist[0] : booking.waitlist;

        // 1. Bloqueio se estiver na fila de espera ativa
        if (waitlist?.status === 'waiting') {
          return NextResponse.json({
            error: "Não é possível confirmar uma reserva que ainda está na lista de espera. Aguarde a reatribuição de recursos."
          }, { status: 400 });
        }

        // 2. Bloqueio se o parceiro estiver pendente
        const partnerData = Array.isArray(booking.partner) ? booking.partner[0] : booking.partner;
        if (partnerData?.status === 'pending') {
          return NextResponse.json({
            error: "Este parceiro está com estado 'Pendente'. Não é permitido aceitar reservas enquanto o registo não for aprovado e ativado pela administração."
          }, { status: 400 });
        }
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json(updated);
    }

    if (action === "CANCEL_WITH_REASSIGN") {
      const { id, reason } = data;

      // Primeiro verifica permissão
      const { data: booking, error: fetchError } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !booking) {
        return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
      }

      if (!canSeeWaitlist && booking.partner_id !== partnerId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      // Update to canceled
      const { data: canceled, error: cancelError } = await supabaseAdmin
        .from("bookings")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (cancelError) throw cancelError;

      // Attempt reassignment
      const reassignResult = await attemptReassignment(booking, reason);

      return NextResponse.json({
        canceled,
        reassignment: reassignResult,
      });
    }

    if (action === "MANUAL_ASSIGN") {
      const { id, partnerId: newPartnerId, vehicleId } = data;

      if (!canSeeWaitlist) {
        return NextResponse.json({ error: "Apenas administradores podem atribuir recursos manualmente" }, { status: 403 });
      }

      // 1. Fetch the driver currently assigned to this vehicle
      const { data: vehicle, error: vehicleError } = await supabaseAdmin
        .from("vehicles")
        .select("current_driver_id")
        .eq("id", vehicleId)
        .single();

      if (vehicleError) {
        console.error("Error fetching vehicle driver:", vehicleError);
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({
          partner_id: newPartnerId,
          vehicle_id: vehicleId,
          driver_id: vehicle?.current_driver_id || data.driverId || null,
          status: "pending",
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Close waitlist entries if any
      await supabaseAdmin
        .from("booking_waitlist")
        .update({
          status: "reassigned",
          reassigned_at: new Date().toISOString()
        })
        .eq("booking_id", id)
        .eq("status", "waiting");

      // Notify Client (Manual Assignment)
      await notifyClientAboutAssignment(id);

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de reservas:", error);
    return NextResponse.json(
      { error: "Erro na operação de reservas." },
      { status: 500 },
    );
  }
}
