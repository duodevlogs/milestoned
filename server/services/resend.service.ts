import "server-only";

import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(key);
  }
  return client;
}

export const resendService = {
  /**
   * The Resend SDK returns {data,error} instead of throwing on failure —
   * destructure and manually throw, or a failed send silently vanishes
   * (confirmed the hard way during the original founding-member email work).
   */
  async sendPortalOtpEmail(to: string, code: string, projectName: string): Promise<void> {
    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      throw new Error("RESEND_FROM_EMAIL is not set");
    }

    const { error } = await getClient().emails.send({
      from,
      to,
      subject: `Your access code for ${projectName}`,
      text: `Your one-time code to view "${projectName}" is ${code}.\n\nThis code expires in 10 minutes and can only be used once. If you didn't request this, you can safely ignore this email.`,
    });

    if (error) {
      throw new Error(`Failed to send portal OTP email: ${error.message}`);
    }
  },
};
