export async function sendWaitlistEmail(options: {
  apiKey: string;
  to: string;
  name: string | null;
}): Promise<void> {
  const greeting = options.name ? `Hi ${options.name},` : "Hi,";
  const text = [
    greeting,
    "",
    "You're on the list. We'll be in touch.",
    "",
    "Smart Grocer is a beta mobile app. You type a grocery list. We find live local products and prices at the stores you already shop, pick the lowest matching price per item, and group the result into a trip you shop in the aisle.",
    "",
    "No need to reply. We'll email when it's your turn to try the beta.",
    "",
    "Stop searching. Start saving.",
    "Smart Grocer",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FAF9F6;font-family:Inter,Helvetica,Arial,sans-serif;color:#3E3124;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#EBE7DD;border:1px solid #D6D0C4;border-radius:16px;padding:36px 32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.14em;font-weight:600;color:#3E3124;">SMART GROCER</p>
                <p style="margin:0 0 24px;font-size:14px;color:#8C8273;">Stop searching. Start saving.</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${escapeHtml(greeting)}</p>
                <p style="margin:0 0 16px;font-size:18px;line-height:1.5;font-weight:600;">You're on the list. We'll be in touch.</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#3E3124;">
                  Smart Grocer is a beta mobile app. You type a grocery list. We find live local products and prices at the stores you already shop, pick the lowest matching price per item, and group the result into a trip you shop in the aisle.
                </p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#8C8273;">
                  No need to reply. We'll email when it's your turn to try the beta.
                </p>
                <p style="margin:0;font-size:14px;color:#8C8273;">Save more money — and more time — on every grocery run.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Smart Grocer <hello@smartgrocerapp.com>",
      to: [options.to],
      subject: "You're on the list",
      text,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
