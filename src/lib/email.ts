import { Resend } from "resend";

function normalizeResendApiKey(rawValue: string | undefined) {
  if (!rawValue) return "";

  const trimmed = rawValue.trim();

  // Recover from accidental .env value like: RESEND_API_KEY="RESEND_API_KEY=re_xxx"
  if (trimmed.startsWith("RESEND_API_KEY=")) {
    return trimmed.slice("RESEND_API_KEY=".length).trim();
  }

  return trimmed;
}

function resolveFromAddress() {
  const configured = (process.env.EMAIL_FROM_ADDRESS || "").trim();

  if (!configured || configured.endsWith("@example.com")) {
    console.warn("EMAIL_FROM_ADDRESS is not configured to a verified sender. Falling back to onboarding@resend.dev.");
    return "onboarding@resend.dev";
  }

  return configured;
}

const resendApiKey = normalizeResendApiKey(process.env.RESEND_API_KEY);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set or invalid — skipping email send");
    return null;
  }

  const fromName = (process.env.EMAIL_FROM_NAME || "Native Delicacies").trim() || "Native Delicacies";
  const fromAddress = resolveFromAddress();

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromAddress}>`,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }

  return data;
}
