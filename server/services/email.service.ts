import "server-only";

import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(key);
  }
  return resend;
}

function wrapper(bodyHtml: string): string {
  return `<div style="background:#0d1117;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:480px;margin:0 auto;">
      <div style="margin-bottom:28px;font-size:16px;font-weight:600;color:#f0f3f6;">Milestoned</div>
      <div style="background:#12171f;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:32px;color:#e6edf3;font-size:14.5px;line-height:1.6;">
        ${bodyHtml}
      </div>
      <div style="margin-top:20px;font-size:12.5px;color:#6e7781;">© 2026 Milestoned</div>
    </div>
  </div>`;
}

export const emailService = {
  /**
   * Sent once a founding-member payment is recorded. Copy matches the
   * product's calm, direct voice — short sentences, no exclamation points.
   */
  async sendFoundingMemberConfirmation(to: string): Promise<void> {
    // Resend's SDK does not throw on API errors — it returns { data, error }.
    // Ignoring `error` here would make every failed send look like success.
    const { error } = await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Milestoned <onboarding@resend.dev>",
      to,
      subject: "You're in — here's what happens next",
      html: wrapper(`
        <p style="margin:0 0 16px;color:#f0f3f6;font-size:16px;font-weight:600;">You're in.</p>
        <p style="margin:0 0 16px;">Your founding member spot is confirmed. The price is locked in, and your access is guaranteed when Milestoned launches.</p>
        <p style="margin:0 0 16px;">At launch, your account starts with 20 generation credits — no extra step needed on your end.</p>
        <p style="margin:0;">We'll email you again the day we open the doors.</p>
      `),
      text: "You're in.\n\nYour founding member spot is confirmed. The price is locked in, and your access is guaranteed when Milestoned launches.\n\nAt launch, your account starts with 20 generation credits — no extra step needed on your end.\n\nWe'll email you again the day we open the doors.",
    });

    if (error) {
      throw new Error(`Resend error (${error.name}): ${error.message}`);
    }
  },
};
