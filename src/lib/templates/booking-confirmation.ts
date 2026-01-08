export function getBookingConfirmationTemplate(data: {
  bookingId: string;
  customerName: string;
  booking: any;
  userCreated: boolean;
}) {
  const { bookingId, customerName, booking, userCreated } = data;

  return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de Reserva</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8faff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8faff; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #003580; padding: 30px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">WiTransfer</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Aluguer de Viaturas em Angola</p>
                </td>
              </tr>

              <!-- Success Badge -->
              <tr>
                <td style="padding: 30px 40px 20px 40px; text-align: center;">
                  <div style="display: inline-block; background-color: #d4edda; border: 2px solid #28a745; border-radius: 50px; padding: 10px 20px;">
                    <span style="color: #155724; font-weight: bold; font-size: 14px;">✓ Reserva Confirmada</span>
                  </div>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <h2 style="color: #003580; font-size: 22px; margin: 0 0 15px 0;">Olá ${customerName}!</h2>
                  
                  ${
                    userCreated
                      ? `
                    <div style="background-color: #e7f3ff; border-left: 4px solid #006ce4; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                      <p style="margin: 0; color: #003580; font-size: 14px;">
                        <strong>🎉 Conta criada com sucesso!</strong><br>
                        Uma nova conta foi criada automaticamente para você com o email <strong>${booking.customerEmail}</strong>
                      </p>
                    </div>
                  `
                      : ""
                  }

                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    A sua reserva foi confirmada com sucesso! Abaixo estão os detalhes da sua reserva:
                  </p>

                  <!-- Booking Details Box -->
                  <div style="background-color: #f8faff; border: 1px solid #e0e6ed; border-radius: 6px; padding: 20px; margin: 20px 0;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">ID da Reserva:</td>
                        <td style="color: #003580; font-weight: bold; font-size: 14px; text-align: right; padding: 8px 0;">${bookingId}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Status:</td>
                        <td style="text-align: right; padding: 8px 0;">
                          <span style="background-color: #ffc107; color: #000; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">PENDENTE</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px; padding: 8px 0;">Data da Reserva:</td>
                        <td style="color: #333; font-weight: bold; font-size: 14px; text-align: right; padding: 8px 0;">
                          ${new Date(booking.createdAt).toLocaleDateString(
                            "pt-AO",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Next Steps -->
                  <div style="margin: 30px 0;">
                    <h3 style="color: #003580; font-size: 18px; margin: 0 0 15px 0;">Próximos Passos:</h3>
                    <ol style="color: #333; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Aguarde a confirmação do pagamento</li>
                      <li>Receberá um email com os detalhes completos da viatura</li>
                      <li>Prepare a documentação necessária (BI/Passaporte e Carta de Condução)</li>
                      <li>No dia da recolha, dirija-se ao local indicado</li>
                    </ol>
                  </div>

                  <!-- Support Info -->
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 13px;">
                      <strong>💡 Precisa de ajuda?</strong><br>
                      Entre em contato connosco através do email <a href="mailto:suporte@witransfer.ao" style="color: #003580;">suporte@witransfer.ao</a> ou telefone <strong>+244 XXX XXX XXX</strong>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8faff; padding: 20px 40px; border-top: 1px solid #e0e6ed;">
                  <p style="margin: 0 0 10px 0; color: #666; font-size: 12px; text-align: center;">
                    Este é um email automático, por favor não responda.
                  </p>
                  <p style="margin: 0; color: #999; font-size: 11px; text-align: center;">
                    © ${new Date().getFullYear()} WiTransfer. Todos os direitos reservados.<br>
                    Luanda, Angola
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
