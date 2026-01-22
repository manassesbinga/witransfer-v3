import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, role, partnerId, data } = body;
    const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(role);

    if (action === "LIST") {
      let query = supabaseAdmin.from("users").select("*");
      if (!isSystemAdmin) {
        query = query.eq("partner_id", partnerId);
      }
      const { data: users, error } = await query;
      if (error) throw error;
      return NextResponse.json(users.map(({ password_hash, ...rest }: any) => rest));
    }

    if (action === "SAVE") {
      const isNew = !data.id;
      if (isNew) {
        const targetPartnerId = isSystemAdmin ? data.partnerId || null : partnerId;

        const newUser = {
          email: data.email,
          full_name: data.name,
          phone: data.phone,
          role: data.role || "PARTNER_STAFF",
          partner_id: targetPartnerId,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: insertedUser, error } = await supabaseAdmin
          .from("users")
          .insert([newUser])
          .select()
          .single();

        if (error) throw error;

        // E-mail sending logic
        if (data.email) {
          let partnerName = "WiTransfer";
          if (targetPartnerId) {
            const { data: partner } = await supabaseAdmin
              .from("partners")
              .select("name")
              .eq("id", targetPartnerId)
              .single();
            partnerName = partner?.name || "WiTransfer";
          }

          const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login/invite?id=${insertedUser.id}`;

          await sendEmail({
            to: data.email,
            subject: `Convite WiTransfer: Você foi adicionado à equipa ${partnerName}`,
            template: "invitation",
            templateData: {
              type: "user",
              name: data.name,
              companyName: partnerName,
              inviteLink,
            },
          }).catch((err) => console.error("Falha ao enviar e-mail de convite:", err));
        }

        const { password_hash, ...safeUser } = insertedUser;
        return NextResponse.json(safeUser);
      } else {
        // UPDATE case
        // Check permission first
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("partner_id")
          .eq("id", data.id)
          .single();

        if (!existingUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        if (!isSystemAdmin && existingUser.partner_id !== partnerId) {
          return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const updateData = {
          full_name: data.name,
          phone: data.phone,
          role: data.role,
          is_active: data.isActive,
          updated_at: new Date().toISOString(),
        };

        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from("users")
          .update(updateData)
          .eq("id", data.id)
          .select()
          .single();

        if (updateError) throw updateError;
        const { password_hash, ...safeUser } = updatedUser;
        return NextResponse.json(safeUser);
      }
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro na operação de usuários:", error);
    return NextResponse.json({ error: "Erro na operação de usuários." }, { status: 500 });
  }
}
