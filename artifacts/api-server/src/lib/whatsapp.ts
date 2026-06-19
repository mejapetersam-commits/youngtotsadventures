import { logger } from "./logger";

interface NotifyRegistrationParams {
  childName: string;
  parentName: string;
  parentPhone: string;
  registrationId: number;
}

/**
 * Sends a WhatsApp alert via CallMeBot to Judie and Celestine.
 * Requires CALLMEBOT_APIKEY_JUDIE and CALLMEBOT_APIKEY_CELESTINE env vars.
 * One-time setup per number: each person must send
 *   "I allow callmebot to send me messages"
 * to +34 644 71 77 96 on WhatsApp to receive their API key.
 */
export async function notifyNewRegistration(params: NotifyRegistrationParams): Promise<void> {
  const { childName, parentName, parentPhone, registrationId } = params;

  const message = encodeURIComponent(
    `🦁 New Safari Registration!\n\nID: #${registrationId}\nChild: ${childName}\nParent: ${parentName}\nPhone: ${parentPhone}\n\nCheck the admin dashboard for full details.`
  );

  const recipients = [
    { name: "Judie", phone: "254720764275", apiKey: process.env.CALLMEBOT_APIKEY_JUDIE },
    { name: "Celestine", phone: "254724810846", apiKey: process.env.CALLMEBOT_APIKEY_CELESTINE },
  ];

  await Promise.allSettled(
    recipients.map(async ({ name, phone, apiKey }) => {
      if (!apiKey) {
        logger.warn({ name }, "CallMeBot API key not set — skipping WhatsApp alert");
        return;
      }
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        logger.warn({ name, status: response.status }, "WhatsApp alert failed");
      } else {
        logger.info({ name, registrationId }, "WhatsApp alert sent");
      }
    })
  );
}
