import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { comparePassword } from "@/lib/hashing";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Fetch user with partner info if applicable
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        email,
        password_hash,
        full_name,
        role,
        sub_role,
        partner_id,
        avatar_url,
        is_active,
        partners (
          status,
          is_verified,
          name,
          avatar_url
        )
      `)
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    // New Security Check: If user has a partner_id, ensure partner exists
    if (user.partner_id && !user.partners) {
      return NextResponse.json(
        { error: "A conta do parceiro associada a este utilizador já não existe. Por favor, contacte o administrador." },
        { status: 403 },
      );
    }

    // 2. Verify password
    const isPasswordCorrect = await comparePassword(password, user.password_hash || "");
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    // 3. Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Esta conta está desativada. Contacte o suporte." },
        { status: 403 },
      );
    }

    // 4. Role based logic
    const isSystemAdmin = ["ADMIN", "SUPER_ADMIN", "GERENCIADOR"].includes(user.role);
    const isPartner = ["PARTNER_ADMIN", "PARTNER_STAFF", "DRIVER"].includes(user.role);

    if (!isSystemAdmin && !isPartner) {
      return NextResponse.json(
        { error: "Acesso restrito ao portal administrativo." },
        { status: 403 },
      );
    }

    const partnerStatus = user.partners ? (user.partners as any).status : "active";
    const isVerifiedStatus = user.partners ? (user.partners as any).is_verified : false;
    const isPrincipalPartner = false; // partners table doesn't have is_principal

    console.log("----------------------------------------------------------------");
    console.log("🔍 DEBUG: Login API");
    console.log("👤 User from DB:", JSON.stringify(user, null, 2));
    if (user.partners) {
      console.log("🏢 Partner Linked:", JSON.stringify(user.partners, null, 2));
    } else {
      console.log("❌ No Partner Linked");
    }

    const userData = {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      subRole: user.sub_role,
      partnerId: user.partner_id,
      // Use partner avatar if user avatar is missing and is a partner admin
      avatarUrl: user.avatar_url || (user.partners ? (user.partners as any).avatar_url : null),
      partnerName: user.partners ? (user.partners as any).name : null,
      partnerStatus: partnerStatus,
      isVerified: isSystemAdmin || isVerifiedStatus || isPrincipalPartner,
      isPrincipal: isPrincipalPartner
    };

    console.log("🚀 Constructed UserData:", JSON.stringify(userData, null, 2));
    console.log("----------------------------------------------------------------");

    const token = await createToken(userData);

    return NextResponse.json({
      success: true,
      user: userData,
      token,
    });
  } catch (error: any) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
