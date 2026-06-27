import nodemailer from "nodemailer";
import { logger } from "./logger";

interface PaymentConfirmationParams {
  parentName: string;
  parentEmail: string;
  childName: string;
  registrationId: number;
  registeredAt: Date;
}

export interface EmailResult {
  sent: boolean;
  error: string | null;
}

const PROGRAM_NAME = "Summer Safari 2026";
const PROGRAM_DATES = "6th – 10th July 2026";
const PROGRAM_LOCATION = "Nairobi, Kenya";
const CONTACT_EMAIL = "youngtotsedventures@gmail.com";
const CONTACT_PHONE_1 = "0720 764 275";
const CONTACT_PHONE_2 = "0724 810 846";

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  const portNum = Number(port);
  return nodemailer.createTransport({
    host,
    port: portNum,
    secure: portNum === 465,
    auth: { user, pass },
  });
}

function buildHtml(params: PaymentConfirmationParams): string {
  const { parentName, childName, registeredAt } = params;
  const dateStr = registeredAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#2d2a26;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ea;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#1f6f54;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Young Tots Edventures</h1>
              <p style="margin:6px 0 0;color:#e8f3ee;font-size:14px;">${PROGRAM_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <div style="text-align:center;font-size:40px;line-height:1;margin-bottom:8px;">🎉</div>
              <h2 style="margin:0 0 16px;font-size:20px;color:#1f6f54;text-align:center;">Payment Confirmed</h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Dear ${parentName},</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                Great news! We have received your payment and your child's spot is now <strong>secured</strong>
                for <strong>${PROGRAM_NAME}</strong>.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ea;border-radius:8px;margin:0 0 20px;">
                <tr><td style="padding:16px 20px;font-size:14px;line-height:1.8;">
                  <strong>Child:</strong> ${childName}<br />
                  <strong>Program:</strong> ${PROGRAM_NAME}<br />
                  <strong>Dates:</strong> ${PROGRAM_DATES}<br />
                  <strong>Location:</strong> ${PROGRAM_LOCATION}<br />
                  <strong>Registered on:</strong> ${dateStr}
                </td></tr>
              </table>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;"><strong>What's next?</strong></p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                Keep this email for your records. Closer to the start date we will share the daily
                schedule, drop-off and pick-up details, and a packing list. No further payment is required.
              </p>
              <p style="margin:0 0 4px;font-size:15px;line-height:1.6;">Questions? We're happy to help:</p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.8;">
                📧 <a href="mailto:${CONTACT_EMAIL}" style="color:#1f6f54;">${CONTACT_EMAIL}</a><br />
                📱 WhatsApp / Call: ${CONTACT_PHONE_1} &nbsp;|&nbsp; ${CONTACT_PHONE_2}
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;">
                We can't wait to welcome ${childName} on an unforgettable adventure!<br />
                <strong>The Young Tots Edventures Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f4f1ea;padding:16px 32px;text-align:center;font-size:12px;color:#8a857c;">
              &copy; 2026 Young Tots Edventures. All Rights Reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a payment confirmation email to the parent/guardian.
 * Never throws — returns { sent, error } and logs failures so callers don't crash.
 */
export async function sendPaymentConfirmationEmail(
  params: PaymentConfirmationParams,
): Promise<EmailResult> {
  const transporter = getTransporter();
  if (!transporter) {
    const msg = "SMTP not configured — skipping confirmation email";
    logger.warn({ registrationId: params.registrationId }, msg);
    return { sent: false, error: "Email service is not configured." };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER!;

  try {
    await transporter.sendMail({
      from: `"Young Tots Edventures" <${from}>`,
      to: params.parentEmail,
      subject: "Payment Confirmed – Young Tots Edventures 🎉",
      html: buildHtml(params),
    });
    logger.info(
      { registrationId: params.registrationId, to: params.parentEmail },
      "Payment confirmation email sent",
    );
    return { sent: true, error: null };
  } catch (err) {
    logger.error(
      { err, registrationId: params.registrationId },
      "Failed to send payment confirmation email",
    );
    return { sent: false, error: "Failed to send confirmation email." };
  }
}
