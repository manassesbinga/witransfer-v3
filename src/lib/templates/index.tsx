import React from "react";
import WitransferOtpEmail from "./emails/otp-template";
import InvitationEmail from "./emails/invitation-template";

export type TemplateName = "otp" | "booking_confirmation" | "invitation";

export function renderEmailTemplate(name: TemplateName, data: any): string {
  // Importação dinâmica para evitar erros de compilação do Next.js App Router
  const { renderToStaticMarkup } = require("react-dom/server");

  let html = "";
  switch (name) {
    case "otp":
      html = renderToStaticMarkup(
        <WitransferOtpEmail otpCode={data.otp} userName={data.userName} />,
      );
      break;
    case "invitation":
      html = renderToStaticMarkup(
        <InvitationEmail
          type={data.type}
          name={data.name}
          companyName={data.companyName}
          inviteLink={data.inviteLink}
        />,
      );
      break;
    default:
      throw new Error(`Template ${name} não encontrado`);
  }
  return `<!DOCTYPE html>${html}`;
}
