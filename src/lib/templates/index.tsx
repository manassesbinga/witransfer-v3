import React from "react";
import WitransferOtpEmail from "./emails/otp-template";
import InvitationEmail from "./emails/invitation-template";
import DigitalReceiptEmail from "./emails/DigitalReceiptEmail";
import AssignmentEmail from "./emails/AssignmentEmail";

export type TemplateName = "otp" | "booking_confirmation" | "invitation" | "digital_receipt" | "booking_assignment";

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
    case "booking_confirmation":
      const { getBookingConfirmationTemplate } = require("./booking-confirmation");
      html = getBookingConfirmationTemplate(data);
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
    case "digital_receipt":
      html = renderToStaticMarkup(
        <DigitalReceiptEmail
          booking={data.booking}
          customerName={data.customerName}
        />,
      );
      break;
    case "booking_assignment":
      html = renderToStaticMarkup(
        <AssignmentEmail
          booking={data.booking}
          customerName={data.customerName}
          vehicle={data.vehicle}
          driver={data.driver}
          partner={data.partner}
        />,
      );
      break;
    default:
      throw new Error(`Template ${name} não encontrado`);
  }
  return `<!DOCTYPE html>${html}`;
}
