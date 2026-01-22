import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
import { getBookingConfirmationTemplate } from "@/lib/templates/booking-confirmation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, text, type, data } = body;

    // Se for um tipo de email com template
    if (type) {
      let emailSubject = subject;
      let emailHtml = html;

      switch (type) {
        case "booking_confirmation":
          emailSubject = `Confirmação de Reserva #${data.bookingId} - WiTransfer`;
          emailHtml = getBookingConfirmationTemplate(data);
          break;

        case "transfer_confirmation":
          emailSubject = `Confirmação de Viagem #${data.transferId} - WiTransfer`;
          emailHtml = getBookingConfirmationTemplate({
            ...data,
            bookingId: data.transferId,
            booking: data.transfer,
          });
          break;

        case "user_created":
          emailSubject = "Bem-vindo à WiTransfer!";
          emailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #003580;">Bem-vindo à WiTransfer!</h1>
                            <p>Olá ${data.customerName},</p>
                            <p>A sua conta foi criada com sucesso!</p>
                            <p>Email: <strong>${data.email}</strong></p>
                            <p>Agora pode fazer reservas e acompanhar o histórico das suas viagens.</p>
                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 12px;">WiTransfer - Aluguer de Viaturas em Angola</p>
                        </div>
                    `;
          break;

        default:
          if (!subject || (!html && !text)) {
            return NextResponse.json(
              {
                error: "Campos obrigatórios (to, subject, html/text) em falta",
              },
              { status: 400 },
            );
          }
      }

      const info = await sendEmail({
        to,
        subject: emailSubject,
        html: emailHtml,
        text: text || emailHtml.replace(/<[^>]*>/g, ""),
      });



      return NextResponse.json({
        success: true,
        message: "E-mail enviado com sucesso",
        messageId: info.messageId,
      });
    }

    // Email genérico sem template
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        {
          error: "Campos obrigatórios (to, subject, html/text) em falta",
        },
        { status: 400 },
      );
    }

    const info = await sendEmail({ to, subject, html, text });



    return NextResponse.json({
      success: true,
      message: "E-mail enviado com sucesso",
      messageId: info.messageId,
    });
  } catch (error: any) {

    return NextResponse.json(
      {
        error: "Erro ao processar o envio de e-mail",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
