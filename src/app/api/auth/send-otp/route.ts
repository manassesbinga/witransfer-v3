import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "E-mail é obrigatório" },
        { status: 400 },
      );
    }

    // Gerar OTP de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 1. Verificar se o usuário existe para armazenar o OTP
    // Nota: Se o usuário não existir, podemos ou retornar erro ou (melhor) criar um usuário "provisório" ou lidar com isso na verificação.
    // Conforme o pedido do usuário, o cadastro acontece no checkout. 
    // Se ele está tentando logar e não existe, talvez ele precise se cadastrar primeiro? 
    // Ou permitimos "login" que gera o usuário?

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, full_name")
      .eq("email", email.toLowerCase())
      .single();

    if (user) {
      // Atualizar o usuário existente com o novo OTP
      await supabaseAdmin
        .from("users")
        .update({
          otp_code: otp,
          otp_expiry: expiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
    } else {
      // Create pending user automatically to allow login
      const { error: createError } = await supabaseAdmin
        .from("users")
        .insert([{
          email: email.toLowerCase(),
          otp_code: otp,
          otp_expiry: expiry.toISOString(),
          role: 'CLIENT',
          full_name: 'Cliente', // Placeholder
          is_active: true, // Replaced status with is_active
          created_at: new Date().toISOString()
        }]);

      if (createError) {
        console.error("Failed to create pending user:", createError);
        throw createError;
      }
    }

    // Enviar o e-mail usando o sistema de templates centralizado
    await sendEmail({
      to: email,
      subject: `${otp} é o seu código de verificação WiTransfer`,
      template: "otp",
      templateData: { otp, userName: user?.full_name || "Cliente" },
    });

    return NextResponse.json({
      success: true,
      message: "Código enviado para o e-mail",
    });
  } catch (error: any) {
    console.error("Error in send-otp:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao enviar e-mail de verificação",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
