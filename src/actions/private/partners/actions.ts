"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath, revalidateTag } from "next/cache"
import type { PartnerFormData, ActionResult as PartnerActionResult } from "@/types"
import { actionMiddleware } from "@/middlewares/actions/action-factory"
import { hashPassword } from "@/lib/hashing"
import { getAdminSessionInternal } from "../session"

export async function registerPartnerAction(
    data: PartnerFormData
): Promise<PartnerActionResult> {
    return actionMiddleware(
        "RegisterPartner",
        async (formData: PartnerFormData) => {
            console.log("----------------------------------------------------------------");
            console.log("🔍 DEBUG: registerPartnerAction");
            console.log("📦 Form Data:", JSON.stringify(formData, null, 2));
            console.log("----------------------------------------------------------------");

            const {
                email,
                password,
                nome,
                nomeEmpresa,
                tipo,
                nif,
                telefonePrincipal,
                nomeResponsavel,
                avatarUrl,
                logo,
                provincia,
                municipio,
                rua,
                tipoRemuneracao,
                documentUrl,
                servicos,
                parceiroVerificado,
                valorRemuneracao,
                whatsapp,
                website,
                numeroPorta,
                pais
            } = formData

            // Check Permissions
            const session = await getAdminSessionInternal();
            const isAdmin = session?.role && ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(session.role);

            // 1. Create Partner Entity (Pending)
            const { data: partner, error: partnerError } = await supabaseAdmin
                .from("partners")
                .insert([{
                    name: nomeEmpresa || nome, // Commercial Name
                    legal_name: nome,          // Official Name
                    type: tipo,
                    nif: nif,
                    email: email || "",
                    phone: telefonePrincipal,
                    manager_name: nomeResponsavel,
                    website: website,
                    phone_alt: formData.telefoneAlternativo,
                    whatsapp: whatsapp,

                    // Address
                    address_province: provincia,
                    address_city: municipio,
                    address_street: rua,
                    address_number: numeroPorta,
                    address_zip: formData.codigoPostal,
                    // address_country: pais || "Angola", // Removed due to schema cache error

                    // Details
                    employees_count: formData.tamanhoEmpresa,

                    // Config
                    remuneration_type: isAdmin ? (tipoRemuneracao || "percentual") : "percentual",
                    remuneration_value: isAdmin ? (valorRemuneracao || "15") : "15",

                    status: isAdmin && parceiroVerificado ? "active" : "pending",
                    is_verified: isAdmin ? (parceiroVerificado || false) : false,
                    avatar_url: avatarUrl,
                    logo_url: typeof logo === 'string' ? logo : (avatarUrl || ""),
                    document_url: documentUrl || ""
                }])
                .select()
                .single()

            if (partnerError) {
                // Postgres Unique Violation Code
                if (partnerError.code === '23505') {
                    throw new Error("Já existe um parceiro registrado com este NIF ou Email.")
                }
                throw partnerError
            }

            // 2. Create User Entity (Partner Admin)
            if (password) {
                const hashedPassword = await hashPassword(password)

                const { error: userError } = await supabaseAdmin
                    .from("users")
                    .insert([{
                        email: email,
                        password_hash: hashedPassword,
                        full_name: nomeResponsavel || nome,
                        phone: telefonePrincipal,
                        role: "PARTNER_ADMIN",
                        partner_id: partner.id,
                        avatar_url: avatarUrl,
                        is_active: true // User is active, but partner entity is pending approval
                    }])

                if (userError) {
                    // Rollback partner creation if user fails (simplified manual rollback)
                    await supabaseAdmin.from("partners").delete().eq("id", partner.id)

                    // Handle duplicate email specifically
                    if (userError.code === '23505' || userError.message?.includes('email')) {
                        throw new Error("Este endereço de e-mail já está sendo utilizado por outro usuário.")
                    }

                    throw userError
                }
            }

            // 3. Create Services
            if (servicos && servicos.length > 0) {
                const servicesToInsert = servicos.map(s => ({
                    partner_id: partner.id,
                    name: s,
                    billing_type: 'fixed',
                    is_active: true
                }))
                await supabaseAdmin.from("services").insert(servicesToInsert)
            }

            revalidatePath("/admin/dashboard")

            return {
                message: "Cadastro enviado com sucesso! Aguarde a aprovação administrativa para acessar o portal."
            }
        },
        data
    )
}

export async function getServiceTypesAction(): Promise<PartnerActionResult<Array<{ id: string; name: string }>>> {
    return actionMiddleware(
        "GetServiceTypes",
        async () => {
            const { data, error } = await supabaseAdmin
                .from("categories")
                .select("id, name")
                .is("partner_id", null); // Fetch system-wide service types

            if (error) throw error;

            return (data || []).map(cat => ({
                id: cat.id,
                name: cat.name
            }));
        },
        {}
    )
}

export async function savePartnerProfileAction(
    data: PartnerFormData
): Promise<PartnerActionResult> {
    return actionMiddleware(
        "SavePartnerProfile",
        async (formData: PartnerFormData) => {
            console.log("----------------------------------------------------------------");
            console.log("🔍 DEBUG: savePartnerProfileAction");
            console.log("📦 Form Data:", JSON.stringify(formData, null, 2));
            console.log("----------------------------------------------------------------");

            // This would normally use the session user's partner_id
            // For now, assume we interpret this as an update to "partners" table
            // In a real scenario, we need the partner ID passed in formData or from session

            const session = await getAdminSessionInternal()
            if (!session) throw new Error("Não autenticado")

            const { data: user } = await supabaseAdmin.from("users").select("partner_id").eq("id", session.id).single()
            if (!user?.partner_id) throw new Error("Parceiro não encontrado")

            const partnerId = user.partner_id

            // 1. Build Update Object dynamically (exclude null/empty if not intentional)
            const updateFields: any = {
                name: formData.nomeEmpresa,
                legal_name: formData.nome,
                nif: formData.nif,
                phone: formData.telefonePrincipal,
                phone_alt: formData.telefoneAlternativo,
                whatsapp: formData.whatsapp,
                website: formData.website,
                manager_name: formData.nomeResponsavel,
                address_province: formData.provincia,
                address_city: formData.municipio,
                address_street: formData.rua,
                address_zip: formData.codigoPostal,
                employees_count: formData.tamanhoEmpresa,
                logo_url: formData.logo,
                avatar_url: formData.logo, // Sync avatar with logo for better UX
                document_url: formData.documentUrl,
                updated_at: new Date().toISOString()
            };

            // Remove undefined or null fields to avoid schema errors if they're not provided
            const cleanUpdate: any = {};
            Object.keys(updateFields).forEach(key => {
                const val = updateFields[key];
                if (val !== undefined && val !== null && val !== "") {
                    cleanUpdate[key] = val;
                }
            });

            console.log("🚀 [UPDATE PARTNER] Clean Payload:", JSON.stringify(cleanUpdate, null, 2));

            const { error: partnerError } = await supabaseAdmin
                .from("partners")
                .update(cleanUpdate)
                .eq("id", partnerId)

            if (partnerError) throw partnerError

            // 2. IMPORTANT: Update the User Avatar as well so it reflects in the Header immediately
            if (formData.logo) {
                console.log("👤 [UPDATE USER] Syncing User Avatar with Partner Logo...");
                await supabaseAdmin
                    .from("users")
                    .update({ avatar_url: formData.logo })
                    .eq("id", session.id);
            }

            // Update Services
            // 1. Delete existing (simplest strategy for now, or diff)
            await supabaseAdmin.from("services").delete().eq("partner_id", partnerId)

            // 2. Insert new
            if (formData.servicos && formData.servicos.length > 0) {
                const servicesToInsert = formData.servicos.map(s => ({
                    partner_id: partnerId,
                    name: s,
                    billing_type: 'fixed',
                    is_active: true
                }))
                // Add error tracking
                const { error: serviceError } = await supabaseAdmin.from("services").insert(servicesToInsert)
                if (serviceError) console.error("Erro ao salvar serviços:", serviceError)
            }

            revalidateTag(`user-profile-${session.id}`)
            revalidatePath("/partners/settings/profile")
            return { message: "Perfil atualizado com sucesso" }
        },
        data
    )
}

export async function getPartnerDashboardStatsAction(
    manualPartnerId?: string
): Promise<PartnerActionResult<any>> {
    return actionMiddleware(
        "GetPartnerDashboardStats",
        async () => {
            const session = await getAdminSessionInternal();
            if (!session) throw new Error("Não autenticado");

            // Priority: session.partnerId. If Admin, can use manualPartnerId.
            const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(session.role);
            const partnerId = isSystemAdmin ? (manualPartnerId || session.partnerId) : session.partnerId;

            if (!partnerId) throw new Error("Parceiro não identificado");

            // Updated queries for new schema
            const queries = [
                supabaseAdmin.from("bookings").select("id, total_price, status, vehicle_id, created_at, service_type, driver_id").eq("partner_id", partnerId),
                supabaseAdmin.from("users").select("id, full_name, role").eq("partner_id", partnerId).eq("role", "DRIVER"),
                supabaseAdmin.from("vehicles").select("id, model, brand, license_plate, status").eq("partner_id", partnerId),
            ];

            const [bookingsRes, membersRes, vehiclesRes] = await Promise.all(queries);

            const bookings = (bookingsRes as any).data || [];
            const members = (membersRes as any).data || [];
            const vehicles = (vehiclesRes as any).data || [];

            const totalRevenue = bookings
                .filter((b: any) => b.status === "confirmed" || b.status === "completed")
                .reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);

            // Recent Operations listing with vehicle details
            const recentOperations = bookings
                .slice(-10)
                .reverse()
                .map((b: any) => {
                    const vehicle = vehicles.find((v: any) => v.id === b.vehicle_id);
                    return {
                        id: b.id,
                        type: b.service_type || "rental", // Corrected column name
                        status: b.status,
                        value: `${Number(b.total_price).toLocaleString('pt-AO')} Kz`,
                        createdAt: b.created_at,
                        date: new Date(b.created_at).toLocaleDateString('pt-PT'),
                        time: new Date(b.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                        vehicle: vehicle ? {
                            model: vehicle.model,
                            brand: vehicle.brand,
                            plate: vehicle.license_plate
                        } : null
                    };
                });

            // Calculate trips per driver
            const driverTripCounts: Record<string, number> = {};
            bookings.forEach((b: any) => {
                if (b.driver_id) {
                    driverTripCounts[b.driver_id] = (driverTripCounts[b.driver_id] || 0) + 1;
                }
            });

            const topMembers = (members as any[])
                .map((d: any) => ({
                    id: d.id,
                    name: d.full_name,
                    rating: 5.0, // Rating implementation pending in schema
                    trips: driverTripCounts[d.id] || 0
                }))
                .sort((a: any, b: any) => b.trips - a.trips)
                .slice(0, 5);

            return {
                stats: {
                    revenue: { value: `${totalRevenue.toLocaleString()} Kz`, change: "+0%", trend: "up" },
                    trips: { value: bookings.length.toString(), change: "+0%", trend: "up" },
                    members: { value: members.length.toString(), change: "+0%", trend: "up" },
                    rating: { value: "5.0", change: "+0", trend: "up" }
                },
                recentOperations,
                topMembers,
                weeklyPerformance: []
            };
        },
        { manualPartnerId }
    )
}

export async function getPartnerProfileAction(): Promise<PartnerActionResult<any>> {
    return actionMiddleware(
        "GetPartnerProfile",
        async () => {
            noStore();
            const session = await getAdminSessionInternal()
            if (!session) throw new Error("Não autenticado")
            const userId = session.id

            const { data: user, error } = await supabaseAdmin
                .from("users")
                .select("*, partners(*)")
                .eq("id", userId)
                .single()

            if (error) throw error

            const partner = user.partners;

            // Fetch services
            let servicesList: string[] = [];
            if (partner?.id) {
                const { data: services } = await supabaseAdmin
                    .from("services")
                    .select("name")
                    .eq("partner_id", partner.id)
                    .eq("is_active", true);

                if (services) {
                    servicesList = services.map(s => s.name);
                }
            } else if (user.partner_id) {
                // Try loading by user.partner_id if join failed or structure is different
                const { data: services } = await supabaseAdmin
                    .from("services")
                    .select("name")
                    .eq("partner_id", user.partner_id)
                    .eq("is_active", true);

                if (services) {
                    servicesList = services.map(s => s.name);
                }
            }

            console.log("----------------------------------------------------------------");
            console.log("🔍 DEBUG: getPartnerProfileAction");
            console.log("👤 User Data (Full):", JSON.stringify(user, null, 2));
            console.log("👤 User ID:", userId);
            console.log("🏢 Partner ID:", user.partner_id);
            console.log("📦 Partner Data (Raw):", JSON.stringify(partner, null, 2));
            console.log("📝 Metadata:", JSON.stringify(partner?.metadata, null, 2));
            console.log("🛠️ Services:", servicesList);
            console.log("----------------------------------------------------------------");

            return {
                id: user.id,
                name: user.full_name,
                email: user.email,
                avatarUrl: user.avatar_url,
                role: user.role,
                partnerId: user.partner_id,

                // Partner Specific (Mapped to form structure)
                nomeEmpresa: partner?.name || "",
                nome: partner?.legal_name || "", // Razão Social / Legal Name
                nomeComercial: partner?.name || "",
                nomeResponsavel: partner?.manager_name || user.full_name || "",
                nif: partner?.nif || "",
                telefonePrincipal: partner?.phone || user.phone || "",
                whatsapp: partner?.whatsapp || "",
                telefoneAlternativo: partner?.phone_alt || user.phone_alt || "",

                emailEmpresa: partner?.email || user.email || "",

                provincia: partner?.address_province || "",
                municipio: partner?.address_city || "",
                rua: partner?.address_street || "",
                codigoPostal: partner?.address_zip || "",

                pais: partner?.address_country || "Angola",

                website: partner?.website || "",
                tamanhoEmpresa: partner?.employees_count || "",

                // Extended Fields (Loaded from profile data)
                objetivo: partner?.objective || "",
                areaAtividade: partner?.activity_area || "",
                mercadosAtuacao: partner?.markets || [],
                setoresAtuacao: partner?.sectors || [],
                cargo: partner?.manager_role || "",
                distrito: partner?.address_city || "",
                registroComercial: partner?.business_license || "",
                bairro: partner?.address_street || "",


                // Config
                tipoRemuneracao: partner?.remuneration_type || "percentual",
                valorRemuneracao: partner?.remuneration_value || "",

                logo: partner?.logo_url || "",
                documentUrl: partner?.document_url || "",
                isVerified: partner?.is_verified || false,
                partnerStatus: partner?.status || "active",

                // Services
                servicos: servicesList
            }
        },
        {}
    )
}

export async function getPendingPartnersAction(): Promise<PartnerActionResult<any[]>> {
    return actionMiddleware(
        "GetPendingPartners",
        async () => {
            const { data, error } = await supabaseAdmin
                .from("partners")
                .select("*")
                .neq("status", "active") // Everything not active is pending/rejected
                .order("created_at", { ascending: false })

            console.log(`DEBUG SERVER: getPendingPartnersAction returned ${data?.length || 0} rows`);
            if (error) {
                console.error("DEBUG SERVER: getPendingPartnersAction error:", error);
                throw error;
            }
            return data || []
        },
        {}
    )
}

export async function approvePartnerAction(partnerId: string): Promise<PartnerActionResult> {
    return actionMiddleware(
        "ApprovePartner",
        async () => {
            console.log(`DEBUG SERVER: Approving partner ${partnerId}...`);

            // 1. Check if partner exists
            const { data: exists, error: findError } = await supabaseAdmin
                .from("partners")
                .select("id")
                .eq("id", partnerId)
                .single();

            if (findError || !exists) {
                console.error("DEBUG SERVER: Partner not found:", findError);
                throw new Error("Parceiro não encontrado.");
            }

            // 2. Perform Update
            const { data, error } = await supabaseAdmin
                .from("partners")
                .update({
                    status: "active",
                    is_verified: true,
                    updated_at: new Date().toISOString()
                })
                .eq("id", partnerId)
                .select();

            if (error) {
                console.error("DEBUG SERVER: Update failed:", error);
                throw error
            }

            console.log("DEBUG SERVER: Partner approved successfully:", data);

            revalidatePath("/admin/dashboard")
            revalidatePath(`/admin/dashboard/${partnerId}`)
            return { message: "Parceiro aprovado e ativado com sucesso!" }
        },
        { partnerId }
    )
}

export async function getActivePartnersAction(): Promise<PartnerActionResult<any[]>> {
    return actionMiddleware(
        "GetActivePartners",
        async () => {
            const { data, error } = await supabaseAdmin
                .from("partners")
                .select("*")
                .eq("status", "active")
                .order("created_at", { ascending: false })

            console.log(`DEBUG SERVER: getActivePartnersAction returned ${data?.length || 0} rows`);
            if (error) {
                console.error("DEBUG SERVER: getActivePartnersAction error:", error);
                throw error;
            }

            // Manually fetch counts to be safe and avoid relationship name issues
            const results = await Promise.all((data || []).map(async p => {
                const [vCount, uCount] = await Promise.all([
                    supabaseAdmin.from("vehicles").select("id", { count: 'exact', head: true }).eq("partner_id", p.id),
                    supabaseAdmin.from("users").select("id", { count: 'exact', head: true }).eq("partner_id", p.id).eq("role", "DRIVER")
                ]);

                return {
                    id: p.id,
                    name: p.name || p.legal_name || "No Name",
                    email: p.email || "No Email",
                    adminName: p.manager_name || "Unknown",
                    status: p.status,
                    createdAt: p.created_at,
                    vehicleCount: vCount.count || 0,
                    memberCount: uCount.count || 0
                }
            }))

            console.log(`DEBUG SERVER: getActivePartnersAction mapped ${results.length} items`);
            return results
        },
        {}
    )
}

export async function getPartnerByIdAction(partnerId: string): Promise<PartnerActionResult<any>> {
    return actionMiddleware(
        "GetPartnerById",
        async () => {
            const { data: partner, error: partnerError } = await supabaseAdmin
                .from("partners")
                .select(`
                    *,
                    vehicles:vehicles(count),
                    users:users(count)
                `)
                .eq("id", partnerId)
                .single();

            if (partnerError) throw partnerError;

            // Get Member count specifically
            const { count: memberCount } = await supabaseAdmin
                .from("users")
                .select("id", { count: 'exact', head: true })
                .eq("partner_id", partnerId)
                .eq("role", "DRIVER");

            return {
                ...partner,
                vehicleCount: partner.vehicles?.[0]?.count || 0,
                memberCount: memberCount || 0
            };
        },
        { partnerId }
    )
}

export async function getPartnersAction(page: number = 1, limit: number = 50): Promise<PartnerActionResult<any[]>> {
    return actionMiddleware(
        "GetPartners",
        async () => {
            const offset = (page - 1) * limit;
            const { data, error } = await supabaseAdmin
                .from("partners")
                .select("*")
                .order("name", { ascending: true })
                .range(offset, offset + limit - 1);

            console.log(`DEBUG SERVER: getPartnersAction (unfiltered) returned ${data?.length || 0} rows`);

            if (error) {
                console.error("DEBUG SERVER: getPartnersAction error:", error);
                throw error;
            }

            const results = await Promise.all((data || []).map(async p => {
                const [vCount, uCount] = await Promise.all([
                    supabaseAdmin.from("vehicles").select("id", { count: 'exact', head: true }).eq("partner_id", p.id),
                    supabaseAdmin.from("users").select("id", { count: 'exact', head: true }).eq("partner_id", p.id).eq("role", "DRIVER")
                ]);

                return {
                    id: p.id,
                    name: p.name || p.legal_name || "Sem Nome",
                    email: p.email || "Sem Email",
                    adminName: p.manager_name || "Desconhecido",
                    status: p.status,
                    createdAt: p.created_at,
                    vehicleCount: vCount.count || 0,
                    memberCount: uCount.count || 0,
                    remuneration_type: p.remuneration_type,
                    remuneration_value: p.remuneration_value,
                    document_url: p.document_url
                }
            }))

            return results
        },
        page
    )
}
