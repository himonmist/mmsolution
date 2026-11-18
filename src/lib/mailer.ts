import "server-only";
import nodemailer from "nodemailer";

/** Sends mail via SMTP_URL when configured; otherwise logs (development only). */
export async function sendMail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_URL) {
    if (process.env.NODE_ENV !== "production") console.info(`[mail:dev] to=${to} subject=${subject}\n${text}`);
    else console.warn("[mail] SMTP_URL not configured — email not sent");
    return;
  }
  const t = nodemailer.createTransport(process.env.SMTP_URL);
  await t.sendMail({ from: process.env.MAIL_FROM ?? "no-reply@localhost", to, subject, text });
}
