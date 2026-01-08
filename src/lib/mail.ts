import nodemailer from "nodemailer";
import { renderEmailTemplate, TemplateName } from "./templates";

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: TemplateName;
  templateData?: any;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  template,
  templateData,
}: SendEmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Se um template for fornecido, renderiza o HTML automaticamente
  let finalHtml = html;
  if (template) {
    finalHtml = renderEmailTemplate(template, templateData);
  }

  const mailOptions = {
    from:
      process.env.SMTP_FROM ||
      `"WiTransfer Support" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html: finalHtml,
  };

  return await transporter.sendMail(mailOptions);
}
