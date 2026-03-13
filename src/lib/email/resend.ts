import { Resend } from "resend";

let client: Resend | null = null;

function getResend(): Resend {
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY!);
  }
  return client;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM_ADDRESS ?? "no-reply@mail.akivot.com";
}

export async function sendVerificationEmail(data: {
  user: { email: string; name?: string };
  url: string;
}): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: data.user.email,
      subject: "Verify your email for Akivot",
      html: buildVerificationHtml(data.url, data.user.name),
    });
    if (error) {
      console.error("[verify-email] send error", { code: error.name, message: error.message });
    }
  } catch (err) {
    console.error("[verify-email] unexpected error", err instanceof Error ? err.message : err);
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendPasswordResetEmail(data: {
  user: { email: string; name?: string };
  url: string;
}): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const { error } = await getResend().emails.send({
      from: getFromAddress(),
      to: data.user.email,
      subject: "Reset your Akivot password",
      html: buildPasswordResetHtml(data.url, data.user.name),
    });
    if (error) {
      console.error("[reset-password] send error", { code: error.name, message: error.message });
    }
  } catch (err) {
    console.error("[reset-password] unexpected error", err instanceof Error ? err.message : err);
  } finally {
    clearTimeout(timeout);
  }
}

function buildVerificationHtml(url: string, name?: string): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:8px;padding:40px;border:1px solid #e5e7eb">
        <tr><td>
          <h1 style="margin:0 0 8px;font-size:20px;color:#111827">Verify your email</h1>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">${greeting} Please confirm your email address to activate your Akivot account.</p>
          <a href="${url}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">Verify email</a>
          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildPasswordResetHtml(url: string, name?: string): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:8px;padding:40px;border:1px solid #e5e7eb">
        <tr><td>
          <h1 style="margin:0 0 8px;font-size:20px;color:#111827">Reset your password</h1>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">${greeting} We received a request to reset your Akivot password.</p>
          <a href="${url}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">Reset password</a>
          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">If you didn't request a password reset, ignore this email. Your password won't change.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
