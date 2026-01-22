import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { toSnakeCase, toCamelCase } from "@/lib/utils";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, role, partnerId, data, id } = body;
        const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(role);

        // DEBUG LOG PARA IDENTIFICAR O QUE A API ESTÁ RECEBENDO
        console.log(`[DRIVER_API_DEBUG] Action: ${action} | UserRole: ${role} | UserPartnerID: ${partnerId} | IsAdmin: ${isSystemAdmin}`);

        if (action === "LIST") {
            console.log(`[DRIVER_API_DEBUG] Iniciando LIST para partnerId: ${partnerId}`);
            // Join with vehicles where current_driver_id = users.id
            let query = supabaseAdmin.from("users").select("*, vehicles!current_driver_id(id, brand, model)");

            if (!isSystemAdmin) {
                if (!partnerId) {
                    console.warn("[DRIVER_API_DEBUG] Acesso de parceiro sem partnerId na sessão");
                    return NextResponse.json([]);
                }
                query = query.eq("partner_id", partnerId);
            } else {
                query = query.in("role", ["DRIVER", "PARTNER_STAFF", "PARTNER_ADMIN"]);
            }

            // Pagination
            const page = data?.page || 1;
            const limit = data?.limit || 1000;
            const offset = (page - 1) * limit;

            const { data: drivers, error } = await query
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1);

            console.log("[DRIVER_API_DEBUG] Raw data from Supabase (first item):", drivers && drivers.length > 0 ? JSON.stringify(drivers[0]) : "Empty");

            console.log(`[DRIVER_API_DEBUG] Resultado da Query - Itens: ${drivers?.length || 0} | Erro: ${error ? JSON.stringify(error) : 'Não'}`);

            if (error) {
                console.error("[DRIVER_API_DEBUG] Erro de Banco de Dados:", error);
                throw error;
            }

            if (drivers && drivers.length > 0) {
                console.log("[DRIVER_API_DEBUG] Membros encontrados no banco:");
                drivers.forEach((u, i) => {
                    console.log(`  [${i}] ID: ${u.id} | Email: ${u.email} | PartnerID na DB: ${u.partner_id}`);
                });
            }

            // Map data to match what the frontend TeamClient expects
            const mappedDrivers = drivers.map(d => {
                const vehicle = d.vehicles && d.vehicles.length > 0 ? d.vehicles[0] : null;
                const vehicleModelText = vehicle ? `${vehicle.brand} ${vehicle.model}` : "---";

                return {
                    ...toCamelCase(d),
                    id: d.id,
                    name: d.full_name,
                    email: d.email,
                    role: d.role,
                    sub_role: d.sub_role,
                    status: d.driver_status || 'offline',
                    telefone: d.phone,
                    phone: d.phone,
                    fotoPerfil: d.avatar_url,
                    vehicleModel: vehicleModelText,
                    vehicleId: vehicle?.id || null,
                };
            });

            console.log("[DRIVER_API_DEBUG] Final mapped items:", mappedDrivers.length);
            return NextResponse.json(mappedDrivers);
        }

        if (action === "CREATE") {
            const dbData = toSnakeCase(data);

            // Map frontend combined role to DB role + sub_role
            let dbRole = "DRIVER";
            let dbSubRole = "driver";

            if (data.role === "attendant" || data.role === "finance_manager" || data.role === "manager") {
                dbRole = "PARTNER_STAFF";
                dbSubRole = data.role;
            } else if (data.role === "motorista" || data.role === "driver") {
                dbRole = "DRIVER";
                dbSubRole = "driver";
            } else {
                // Default or other values
                dbSubRole = data.role || "driver";
            }

            // Hash password if provided (for non-driver roles)
            let passwordHash = null;
            if (data.password && dbRole === "PARTNER_STAFF") {
                const bcrypt = require("bcryptjs");
                passwordHash = await bcrypt.hash(data.password, 10);
            }

            // Map form fields to database fields
            const newDriver = {
                // Personal Info
                full_name: data.name,
                nickname: dbData.nick_name || dbData.nickname,
                email: dbData.email,
                phone: dbData.telefone,
                phone_alt: dbData.telefone_alternativo,
                date_of_birth: data.dateOfBirth || null,
                gender: dbData.gender,
                nationality: dbData.nacionalidade,
                nif: dbData.nif,
                document_number: dbData.numero_documento,
                avatar_url: dbData.foto_perfil,

                // Address
                address_street: dbData.address,
                address_city: dbData.city,
                address_province: dbData.province,

                // Role & Access
                role: dbRole,
                sub_role: dbSubRole,
                password_hash: passwordHash,
                partner_id: isSystemAdmin ? dbData.partner_id || null : partnerId,

                // Driver Specifics
                license_number: dbData.carta_conducao,
                license_date: data.dataEmissaoCarta || null,
                license_expiry: data.dataValidadeCarta || null,
                professional_license: dbData.carta_profissional || false,
                experience_years: dbData.experiencia_anos ? parseInt(dbData.experiencia_anos) : null,
                languages: dbData.idiomas_falados || [],

                // Status
                driver_status: dbData.status || "offline",
                is_active: true,

                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const { data: inserted, error } = await supabaseAdmin
                .from("users")
                .insert([newDriver])
                .select()
                .single();

            if (error) throw error;

            // Update vehicle assignment if provided
            if (data.vehicleId && dbRole === "DRIVER") {
                await supabaseAdmin
                    .from("vehicles")
                    .update({ current_driver_id: inserted.id })
                    .eq("id", data.vehicleId);
            }

            return NextResponse.json(toCamelCase(inserted));
        }

        if (action === "UPDATE") {
            if (!id) return NextResponse.json({ error: "ID do membro não fornecido" }, { status: 400 });

            const dbData = toSnakeCase(data);

            // Hash password if provided and changed
            let passwordHash = undefined;
            if (data.password) {
                const bcrypt = require("bcryptjs");
                passwordHash = await bcrypt.hash(data.password, 10);
            }

            // Map form fields to database fields
            const updateData: any = {
                updated_at: new Date().toISOString(),
            };

            // Only update fields that are provided and not empty (to prevent accidental wiping)
            if (data.name) updateData.full_name = data.name;
            if (data.nickName) updateData.nickname = data.nickName;
            if (data.email) updateData.email = data.email;
            if (data.telefone) updateData.phone = data.telefone;
            if (data.telefoneAlternativo) updateData.phone_alt = data.telefoneAlternativo;
            if (data.dateOfBirth) updateData.date_of_birth = data.dateOfBirth;
            if (data.gender) updateData.gender = data.gender;
            if (data.nacionalidade) updateData.nationality = data.nacionalidade;
            if (data.nif) updateData.nif = data.nif;
            if (data.numeroDocumento) updateData.document_number = data.numeroDocumento;
            if (data.fotoPerfil) updateData.avatar_url = data.fotoPerfil;

            // Address
            if (data.address) updateData.address_street = data.address;
            if (data.city) updateData.address_city = data.city;
            if (data.province) updateData.address_province = data.province;

            // Role & Position
            if (data.role) {
                if (data.role === "motorista" || data.role === "driver") {
                    updateData.role = "DRIVER";
                    updateData.sub_role = "driver";
                } else {
                    updateData.role = "PARTNER_STAFF";
                    updateData.sub_role = data.role;
                }
            }

            // Access
            if (passwordHash) updateData.password_hash = passwordHash;

            // Driver Specifics
            if (data.cartaConducao) updateData.license_number = data.cartaConducao;
            if (data.dataEmissaoCarta) updateData.license_date = data.dataEmissaoCarta;
            if (data.dataValidadeCarta) updateData.license_expiry = data.dataValidadeCarta;
            if (data.cartaProfissional !== undefined) updateData.professional_license = data.cartaProfissional; // Boolean can be false
            if (data.experienciaAnos) updateData.experience_years = parseInt(data.experienciaAnos);
            if (data.idiomasFalados && data.idiomasFalados.length > 0) updateData.languages = data.idiomasFalados;

            // Status
            if (data.status) updateData.driver_status = data.status;
            if (data.disponibilidade) updateData.is_active = data.disponibilidade === "Active";

            const { data: updated, error: updateError } = await supabaseAdmin
                .from("users")
                .update(updateData)
                .eq("id", id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Update vehicle assignment if provided
            if (data.vehicleId !== undefined) {
                // Remove current assignment
                await supabaseAdmin
                    .from("vehicles")
                    .update({ current_driver_id: null })
                    .eq("current_driver_id", id);

                // Assign new vehicle if provided
                if (data.vehicleId) {
                    await supabaseAdmin
                        .from("vehicles")
                        .update({ current_driver_id: id })
                        .eq("id", data.vehicleId);
                }
            }

            return NextResponse.json(toCamelCase(updated));
        }

        if (action === "DELETE") {
            if (!id) return NextResponse.json({ error: "ID do membro não fornecido" }, { status: 400 });
            const { error: deleteError } = await supabaseAdmin
                .from("users")
                .delete()
                .eq("id", id)
                .in("role", ["DRIVER", "PARTNER_STAFF"]); // Safety check

            if (deleteError) throw deleteError;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    } catch (error) {
        console.error("Erro na operação de equipa:", error);
        return NextResponse.json(
            { error: "Erro na operação de equipa." },
            { status: 500 },
        );
    }
}
