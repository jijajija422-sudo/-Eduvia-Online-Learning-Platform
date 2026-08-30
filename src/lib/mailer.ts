import nodemailer, { type Transporter } from "nodemailer";

// ─── Lazy SMTP transporter with credential verification ───────────────────────
// The transporter is built only when needed so the app still boots (and tests
// pass) when SMTP is unconfigured. Before the first real send we call
// transporter.verify() to validate credentials up front; if verification fails
// (bad/missing creds, unreachable host) we fall back to a console "preview" log
// instead of throwing — so email can never crash a request or page load.

type MailerState =
  | { status: "unconfigured" }
  | { status: "ready"; transporter: Transporter }
  | { status: "failed"; error: string };

let mailerState: MailerState | undefined;

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user: string; pass: string };
}

function resolveSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  return {
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass: pass || "" } : undefined,
  };
}

// Builds (and verifies) the transporter once per process. Caches the outcome so
// we don't re-open a connection on every email, and so a failed verification is
// remembered and downgraded to preview mode rather than retried each request.
async function getMailerState(): Promise<MailerState> {
  if (mailerState !== undefined) return mailerState;

  const cfg = resolveSmtpConfig();
  if (!cfg) {
    mailerState = { status: "unconfigured" };
    return mailerState;
  }

  const transporter = nodemailer.createTransport(cfg);
  try {
    // verify() opens a connection and authenticates — this is the "verify
    // credentials before attempting connections" guard the deployment needs.
    await transporter.verify();
    mailerState = { status: "ready", transporter };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[mailer] SMTP verification failed (host=${cfg.host}:${cfg.port}): ${message} — falling back to preview logging.`
    );
    mailerState = { status: "failed", error: message };
  }
  return mailerState;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  const from = process.env.EMAIL_FROM || "Eduvia <noreply@eduvia.example>";
  const state = await getMailerState();

  if (state.status !== "ready") {
    // Unconfigured or verification failed — log a preview so flows stay visible.
    console.info(
      `[mailer:preview] To: ${to} | Subject: ${subject}\n${text || html.replace(/<[^>]+>/g, "")}`
    );
    return;
  }

  try {
    await state.transporter.sendMail({ from, to, subject, html, text });
  } catch (err) {
    // Email must never break a core workflow (enrollment, completion, certs…).
    console.error("[mailer] Email send failed:", err);
  }
}

// ─── Branded email shell ─────────────────────────────────────────────────────

function shell(content: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Eduvia</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:#3b82f6;padding:20px 32px;color:#ffffff;font-size:20px;font-weight:700;">
                Eduvia
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#0f172a;font-size:15px;line-height:1.7;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;">
                You received this email from Eduvia. If you believe this was sent in error, you can ignore it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ─── Reusable templates ──────────────────────────────────────────────────────

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${href}" style="background:#3b82f6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block;">${label}</a>
  </p>`;
}

export const emailTemplates = {
  welcome: (name: string) =>
    sendEmailWrap(
      "Welcome to Eduvia!",
      `<p>Hi ${name},</p><p>Welcome to <strong>Eduvia</strong> — your home for high-quality, text-based learning. Start exploring courses and begin your journey today.</p>`
    ),

  verifyEmail: (name: string, url: string) =>
    sendEmailWrap(
      "Verify your email address",
      `<p>Hi ${name},</p><p>Please confirm your email address to activate your Eduvia account.</p>${button(url, "Verify Email")}<p>If the button doesn't work, copy this link: ${url}</p>`
    ),

  passwordReset: (name: string, url: string) =>
    sendEmailWrap(
      "Reset your password",
      `<p>Hi ${name},</p><p>We received a request to reset your password. This link expires in 1 hour.</p>${button(url, "Reset Password")}<p>If you didn't request this, you can safely ignore this email.</p>`
    ),

  passwordChanged: (name: string) =>
    sendEmailWrap(
      "Your password was changed",
      `<p>Hi ${name},</p><p>This is a confirmation that your Eduvia password was successfully changed. If this wasn't you, contact support immediately.</p>`
    ),

  enrollment: (name: string, courseTitle: string, url: string) =>
    sendEmailWrap(
      "You're enrolled!",
      `<p>Hi ${name},</p><p>You've successfully enrolled in <strong>${courseTitle}</strong>. Let's get learning.</p>${button(url, "Start Learning")}`
    ),

  courseCompletion: (name: string, courseTitle: string, url: string) =>
    sendEmailWrap(
      "Course completed 🎉",
      `<p>Hi ${name},</p><p>Congratulations! You've completed <strong>${courseTitle}</strong>. Your certificate is ready.</p>${button(url, "View Certificate")}`
    ),

  certificateIssued: (name: string, courseTitle: string, url: string) =>
    sendEmailWrap(
      "Your certificate is ready",
      `<p>Hi ${name},</p><p>Your certificate of completion for <strong>${courseTitle}</strong> has been issued.</p>${button(url, "View Certificate")}`
    ),

  quizResult: (name: string, quizTitle: string, passed: boolean, score: number) =>
    sendEmailWrap(
      "Quiz result",
      `<p>Hi ${name},</p><p>You scored <strong>${score}%</strong> on <strong>${quizTitle}</strong>. ${
        passed ? "Great job — you passed!" : "Keep studying and try again."
      }</p>`
    ),

  courseApproved: (name: string, courseTitle: string, url: string) =>
    sendEmailWrap(
      "Course approved",
      `<p>Hi ${name},</p><p>Your course <strong>${courseTitle}</strong> has been approved and is now live on Eduvia.</p>${button(url, "View Course")}`
    ),

  courseRejected: (name: string, courseTitle: string, reason?: string) =>
    sendEmailWrap(
      "Course changes requested",
      `<p>Hi ${name},</p><p>Your course <strong>${courseTitle}</strong> needs a few changes before it can be published.${
        reason ? `</p><p><strong>Reviewer feedback:</strong> ${reason}</p>` : ""
      }`
    ),

  instructorApplication: (name: string) =>
    sendEmailWrap(
      "Instructor application received",
      `<p>Hi ${name},</p><p>Thanks for applying to teach on Eduvia. Our team will review your application and get back to you soon.</p>`
    ),

  instructorApproved: (name: string) =>
    sendEmailWrap(
      "You're now an instructor!",
      `<p>Hi ${name},</p><p>Your instructor application has been approved. You can now create and publish courses on Eduvia.</p>`
    ),

  instructorInvite: (name: string, inviterName: string, url: string, message?: string) =>
    sendEmailWrap(
      "You're invited to teach on Eduvia",
      `<p>Hi ${name || "there"},</p><p><strong>${inviterName}</strong> has invited you to become an instructor on <strong>Eduvia</strong>.${message ? `</p><p style="background:#f8fafc;padding:16px;border-radius:8px;border-left:3px solid #3b82f6;">${message}</p>` : ""}</p><p>Create your instructor account and start building courses today.</p>${button(url, "Accept Invitation")}<p>If the button doesn't work, copy this link: ${url}</p>`
    ),

  newsletter: (name: string) =>
    sendEmailWrap("Welcome to the Eduvia newsletter", `<p>Hi ${name || "there"},</p><p>Thanks for subscribing to the Eduvia newsletter. We'll send you the best new courses and learning tips.</p>`),

  contact: (name: string, subject: string, message: string) =>
    sendEmailWrap(
      `New contact message: ${subject}`,
      `<p><strong>From:</strong> ${name}</p><p><strong>Message:</strong></p><p>${message}</p>`
    ),

  system: (subject: string, message: string) => sendEmailWrap(subject, `<p>${message}</p>`),
};

// Helper that always wraps content in the branded shell and sends.
function sendEmailWrap(subject: string, inner: string) {
  return (to: string) => sendEmail({ to, subject, html: shell(inner), text: inner.replace(/<[^>]+>/g, "") });
}
