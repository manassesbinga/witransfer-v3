import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

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

    // Enviar o e-mail usando o sistema de templates centralizado
    await sendEmail({
      to: email,
      subject: `${otp} é o seu código de verificação WiTransfer`,
      template: "otp",
      templateData: { otp },
    });

    console.log(`[AUTH-API] OTP enviado para ${email}`);

    return NextResponse.json({
      success: true,
      message: "Código enviado para o e-mail",
    });
  } catch (error: any) {
    console.error("Auth OTP Error:", error);
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
