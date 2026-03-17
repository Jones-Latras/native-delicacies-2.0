// ── Branded Email Template System ──

const BRAND = {
  name: "J&J Native Delicacies",
  tagline: "Authentic Filipino Heritage Flavors",
  primaryColor: "#8b4513",
  secondaryColor: "#a0522d",
  accentColor: "#deb887",
  bgColor: "#fdf8f3",
  borderColor: "#f0ebe5",
  textDark: "#3d1e08",
  textMuted: "#78716c",
  textLight: "#a08060",
};

function baseUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function layout(body: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${BRAND.bgColor};font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <!-- Header -->
    <div style="text-align:center;padding:32px 0;background:linear-gradient(135deg,${BRAND.primaryColor} 0%,${BRAND.secondaryColor} 100%);border-radius:16px 16px 0 0;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🍘 ${BRAND.name}</h1>
      <p style="margin:8px 0 0;color:${BRAND.accentColor};font-size:14px;">${BRAND.tagline}</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid ${BRAND.borderColor};border-top:none;">
      ${body}
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0;color:${BRAND.textLight};font-size:12px;">
      <p style="margin:0;">Thank you for choosing ${BRAND.name}!</p>
      <p style="margin:4px 0 0;">Questions? Reply to this email or call us.</p>
      <p style="margin:8px 0 0;"><a href="${baseUrl()}" style="color:${BRAND.primaryColor};text-decoration:none;">${baseUrl()}</a></p>
    </div>
  </div>
</body>
</html>`;
}

function button(text: string, href: string) {
  return `<div style="text-align:center;margin-top:24px;">
    <a href="${href}" style="display:inline-block;padding:12px 32px;background:${BRAND.primaryColor};color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">
      ${text}
    </a>
  </div>`;
}

function orderBox(orderNumber: string) {
  return `<div style="background:${BRAND.bgColor};border:2px dashed ${BRAND.accentColor};border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
    <p style="margin:0;font-size:12px;color:${BRAND.textLight};text-transform:uppercase;letter-spacing:1px;">Order Number</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:${BRAND.primaryColor};letter-spacing:2px;">${orderNumber}</p>
  </div>`;
}

// ── Welcome Email ──

export function welcomeEmailHtml(name: string) {
  return layout(`
    <h2 style="margin:0 0 8px;color:${BRAND.textDark};font-size:20px;">Welcome to ${BRAND.name}! 🎉</h2>
    <p style="margin:0 0 16px;color:${BRAND.textMuted};font-size:14px;line-height:1.6;">
      Hi ${name}, thank you for creating an account with us! We're thrilled to have you join our community of Filipino food lovers.
    </p>
    <p style="margin:0 0 16px;color:${BRAND.textMuted};font-size:14px;line-height:1.6;">
      Explore our selection of handcrafted kakanin, regional specialties, and traditional bilao platters — all made with love and time-honored recipes.
    </p>

    <div style="background:${BRAND.bgColor};border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="margin:0 0 12px;color:${BRAND.textDark};font-size:16px;">Here's what you can do:</h3>
      <ul style="margin:0;padding:0 0 0 20px;color:${BRAND.textMuted};font-size:14px;line-height:1.8;">
        <li>Browse our full menu of authentic Filipino delicacies</li>
        <li>Build custom bilao platters for your events</li>
        <li>Track your orders in real-time</li>
        <li>Save your delivery addresses for faster checkout</li>
      </ul>
    </div>

    ${button("Browse Our Menu →", `${baseUrl()}/menu`)}
  `);
}

// ── Password Reset Email ──

export function passwordResetEmailHtml(name: string, resetUrl: string) {
  return layout(`
    <h2 style="margin:0 0 8px;color:${BRAND.textDark};font-size:20px;">Password Reset Request 🔐</h2>
    <p style="margin:0 0 24px;color:${BRAND.textMuted};font-size:14px;line-height:1.6;">
      Hi ${name}, we received a request to reset your password. Click the button below to set a new password:
    </p>
    ${button("Reset Password →", resetUrl)}
    <p style="margin:24px 0 0;color:${BRAND.textMuted};font-size:13px;line-height:1.6;text-align:center;">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>
  `);
}

// ── Admin: New Order Alert ──

interface NewOrderAlertData {
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
  orderType: string;
}

export function adminNewOrderAlertHtml(order: NewOrderAlertData) {
  const formatted = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(order.total);
  return layout(`
    <h2 style="margin:0 0 8px;color:${BRAND.textDark};font-size:20px;">New Order Received! 🔔</h2>
    <p style="margin:0 0 24px;color:${BRAND.textMuted};font-size:14px;line-height:1.6;">
      A new order has been placed and is awaiting confirmation.
    </p>

    ${orderBox(order.orderNumber)}

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Customer</td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};text-align:right;border-bottom:1px solid ${BRAND.borderColor};font-weight:600;">${order.customerName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Items</td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};text-align:right;border-bottom:1px solid ${BRAND.borderColor};">${order.itemCount} item${order.itemCount > 1 ? "s" : ""}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Type</td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};text-align:right;border-bottom:1px solid ${BRAND.borderColor};">${order.orderType === "DELIVERY" ? "🚗 Delivery" : "🏪 Pickup"}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textMuted};">Total</td>
        <td style="padding:8px 0;font-size:18px;color:${BRAND.primaryColor};text-align:right;font-weight:bold;">${formatted}</td>
      </tr>
    </table>

    ${button("View Order in Admin →", `${baseUrl()}/admin/orders`)}
  `);
}

// ── Contact Form Confirmation ──

export function contactFormConfirmationHtml(name: string) {
  return layout(`
    <h2 style="margin:0 0 8px;color:${BRAND.textDark};font-size:20px;">We Received Your Message! 📬</h2>
    <p style="margin:0 0 16px;color:${BRAND.textMuted};font-size:14px;line-height:1.6;">
      Hi ${name}, thank you for reaching out to us. We've received your message and will get back to you as soon as possible — usually within 24 hours.
    </p>
    <p style="margin:0;color:${BRAND.textMuted};font-size:14px;line-height:1.6;">
      In the meantime, feel free to browse our menu or check your existing orders.
    </p>
    ${button("Browse Our Menu →", `${baseUrl()}/menu`)}
  `);
}

// ── Admin: Contact Form Notification ──

interface ContactMessageData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function adminContactFormHtml(data: ContactMessageData) {
  return layout(`
    <h2 style="margin:0 0 8px;color:${BRAND.textDark};font-size:20px;">New Contact Message 📩</h2>
    <p style="margin:0 0 24px;color:${BRAND.textMuted};font-size:14px;">
      Someone submitted the contact form on your website.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};width:100px;">Name</td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};border-bottom:1px solid ${BRAND.borderColor};font-weight:600;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Email</td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};border-bottom:1px solid ${BRAND.borderColor};">${data.email}</td>
      </tr>
      ${data.phone ? `<tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Phone</td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};border-bottom:1px solid ${BRAND.borderColor};">${data.phone}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Subject</td>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};border-bottom:1px solid ${BRAND.borderColor};font-weight:600;">${data.subject}</td>
      </tr>
    </table>
    <div style="background:${BRAND.bgColor};border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:12px;color:${BRAND.textLight};text-transform:uppercase;letter-spacing:1px;">Message</p>
      <p style="margin:0;font-size:14px;color:${BRAND.textDark};line-height:1.6;white-space:pre-wrap;">${data.message}</p>
    </div>
  `);
}

