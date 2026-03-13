import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || "Native Delicacies"} <${process.env.EMAIL_FROM_ADDRESS || "noreply@example.com"}>`,
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
