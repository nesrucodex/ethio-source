import Resend from "@auth/core/providers/resend";
export const passwordReset = Resend({
  id: "password-reset",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 15 * 60,
  async generateVerificationToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  },
  async sendVerificationRequest({ identifier, token }) {
    const key = process.env.AUTH_RESEND_KEY;
    const from = process.env.AUTH_EMAIL_FROM;
    if (!key || !from)
      throw new Error("Password reset email is not configured");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: identifier,
        subject: "Reset your EthioSource password",
        text: `Your EthioSource password reset code is: ${token}\n\nIt expires in 15 minutes. If you did not request this, ignore this email.`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Could not send password reset email");
  },
});
