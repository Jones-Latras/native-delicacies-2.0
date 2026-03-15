import { sendEmail } from "./email";
import { formatCurrency } from "./utils";

interface OrderWithItems {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: string;
  status: string;
  deliveryAddress?: unknown;
  scheduledTime?: Date | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  isGift: boolean;
  giftMessage?: string | null;
  specialInstructions?: string | null;
  createdAt: Date;
  items: {
    quantity: number;
    priceAtOrder: number;
    menuItem: { name: string };
  }[];
}

export async function sendOrderConfirmationEmail(order: OrderWithItems) {
  const address = order.deliveryAddress as {
    street?: string;
    city?: string;
    postalCode?: string;
  } | null;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#3d1e08;">
          ${item.quantity}x ${item.menuItem.name}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#3d1e08;text-align:right;">
          ${formatCurrency(item.priceAtOrder * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#fdf8f3;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <!-- Header -->
    <div style="text-align:center;padding:32px 0;background:linear-gradient(135deg,#8b4513 0%,#a0522d 100%);border-radius:16px 16px 0 0;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🍘 Native Delicacies</h1>
      <p style="margin:8px 0 0;color:#deb887;font-size:14px;">Authentic Filipino Heritage Flavors</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #f0ebe5;border-top:none;">
      <h2 style="margin:0 0 8px;color:#3d1e08;font-size:20px;">Order Confirmed! ✓</h2>
      <p style="margin:0 0 24px;color:#78716c;font-size:14px;">
        Thank you, ${order.customerName}! Your order has been received and is being processed.
      </p>

      <!-- Order Number -->
      <div style="background:#fdf8f3;border:2px dashed #deb887;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#8b4513;letter-spacing:2px;">${order.orderNumber}</p>
      </div>

      <!-- Order Details -->
      <div style="margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">
          ${order.orderType === "DELIVERY" ? "Delivery To" : "Pickup Order"}
        </p>
        ${
          order.orderType === "DELIVERY" && address
            ? `<p style="margin:0;font-size:14px;color:#3d1e08;">${address.street || ""}, ${address.city || ""} ${address.postalCode || ""}</p>`
            : `<p style="margin:0;font-size:14px;color:#3d1e08;">Ready for pickup at our store</p>`
        }
        ${
          order.scheduledTime
            ? `<p style="margin:4px 0 0;font-size:13px;color:#78716c;">Scheduled: ${new Date(order.scheduledTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</p>`
            : `<p style="margin:4px 0 0;font-size:13px;color:#78716c;">As soon as possible</p>`
        }
      </div>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #8b4513;font-size:12px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Item</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #8b4513;font-size:12px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Amount</th>
        </tr>
        ${itemsHtml}
      </table>

      <!-- Totals -->
      <div style="border-top:2px solid #f0ebe5;padding-top:12px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#78716c;">Subtotal</td>
            <td style="padding:4px 0;font-size:14px;color:#3d1e08;text-align:right;">${formatCurrency(order.subtotal)}</td>
          </tr>
          ${order.discount > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#16a34a;">Discount</td><td style="padding:4px 0;font-size:14px;color:#16a34a;text-align:right;">-${formatCurrency(order.discount)}</td></tr>` : ""}
          ${order.deliveryFee > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#78716c;">Delivery Fee</td><td style="padding:4px 0;font-size:14px;color:#3d1e08;text-align:right;">${formatCurrency(order.deliveryFee)}</td></tr>` : ""}
          ${order.tax > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#78716c;">Tax</td><td style="padding:4px 0;font-size:14px;color:#3d1e08;text-align:right;">${formatCurrency(order.tax)}</td></tr>` : ""}
          ${order.tip > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#78716c;">Tip</td><td style="padding:4px 0;font-size:14px;color:#3d1e08;text-align:right;">${formatCurrency(order.tip)}</td></tr>` : ""}
          <tr>
            <td style="padding:12px 0 4px;font-size:18px;font-weight:bold;color:#3d1e08;border-top:2px solid #8b4513;">Total</td>
            <td style="padding:12px 0 4px;font-size:18px;font-weight:bold;color:#8b4513;text-align:right;border-top:2px solid #8b4513;">${formatCurrency(order.total)}</td>
          </tr>
        </table>
      </div>

      <!-- Payment Status -->
      <div style="margin-top:16px;padding:12px;background:${order.paymentStatus === "PAID" ? "#f0fdf4" : "#fffbeb"};border-radius:8px;">
        <p style="margin:0;font-size:13px;color:${order.paymentStatus === "PAID" ? "#16a34a" : "#d97706"};">
          💳 ${order.paymentMethod === "CARD" ? "Card Payment" : order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Cash at Pickup"} — 
          ${order.paymentStatus === "PAID" ? "Payment Confirmed ✓" : "Payment Pending"}
        </p>
      </div>

      ${
        order.isGift && order.giftMessage
          ? `
      <div style="margin-top:16px;padding:12px;background:#fdf8f3;border-radius:8px;border-left:4px solid #deb887;">
        <p style="margin:0;font-size:12px;color:#a08060;">🎁 Gift Message</p>
        <p style="margin:4px 0 0;font-size:14px;color:#3d1e08;font-style:italic;">"${order.giftMessage}"</p>
      </div>`
          : ""
      }

      <!-- CTA -->
      <div style="text-align:center;margin-top:32px;">
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/track/${order.orderNumber}" 
           style="display:inline-block;padding:12px 32px;background:#8b4513;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">
          Track Your Order →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0;color:#a08060;font-size:12px;">
      <p style="margin:0;">Thank you for choosing Native Delicacies!</p>
      <p style="margin:4px 0 0;">Questions? Reply to this email or call us.</p>
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmed — ${order.orderNumber} | Native Delicacies`,
    html,
  });
}

// ── Status Change Email Notifications ──

interface StatusEmailOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderType: string;
  status: string;
  estimatedReadyTime?: Date | null;
  items?: { name: string; quantity: number; priceAtOrder?: number }[];
  subtotal?: number;
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  tip?: number;
  total?: number;
}

const STATUS_EMAIL_CONFIG: Record<
  string,
  { subject: string; heading: string; emoji: string; message: string; color: string }
> = {
  CONFIRMED: {
    subject: "Order Confirmed",
    heading: "Your Order is Confirmed! ✓",
    emoji: "✅",
    message: "We've received your order and it will be prepared shortly.",
    color: "#16a34a",
  },
  PREPARING: {
    subject: "Now Preparing Your Order",
    heading: "We're Preparing Your Order! 👨‍🍳",
    emoji: "👨‍🍳",
    message: "Our kitchen is now working on your delicious order. Hang tight!",
    color: "#d97706",
  },
  READY: {
    subject: "Order Ready",
    heading: "Your Order is Ready! 🎉",
    emoji: "🎉",
    message: "Your order has been prepared and is ready for pickup.",
    color: "#16a34a",
  },
  OUT_FOR_DELIVERY: {
    subject: "Out for Delivery",
    heading: "Your Order is On Its Way! 🚗",
    emoji: "🚗",
    message: "Your order is now out for delivery. It will arrive soon!",
    color: "#4f46e5",
  },
  COMPLETED: {
    subject: "Order Completed",
    heading: "Order Complete! 🙏",
    emoji: "🙏",
    message: "Thank you for your order! We hope you enjoy every bite.",
    color: "#16a34a",
  },
  CANCELLED: {
    subject: "Order Cancelled",
    heading: "Order Cancelled",
    emoji: "❌",
    message: "Your order has been cancelled. If you were charged, a refund will be processed.",
    color: "#dc2626",
  },
};

export async function sendOrderStatusEmail(order: StatusEmailOrder) {
  const config = STATUS_EMAIL_CONFIG[order.status];
  if (!config) return; // No email for statuses without a config (e.g. NEW)

  const trackingUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/track/${order.orderNumber}`;

  const readyMessage =
    order.status === "READY" && order.orderType === "DELIVERY"
      ? "Your order is ready and will be dispatched for delivery shortly."
      : config.message;

  const itemsHtml = (order.items ?? [])
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#3d1e08;">
            ${item.quantity}x ${item.name}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#3d1e08;text-align:right;">
            ${typeof item.priceAtOrder === "number" ? formatCurrency(item.priceAtOrder * item.quantity) : ""}
          </td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#fdf8f3;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:32px 0;background:linear-gradient(135deg,#8b4513 0%,#a0522d 100%);border-radius:16px 16px 0 0;">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">🍘 Native Delicacies</h1>
      <p style="margin:8px 0 0;color:#deb887;font-size:14px;">Authentic Filipino Heritage Flavors</p>
    </div>

    <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #f0ebe5;border-top:none;">
      <h2 style="margin:0 0 8px;color:#3d1e08;font-size:20px;">${config.heading}</h2>
      <p style="margin:0 0 24px;color:#78716c;font-size:14px;">
        Hi ${order.customerName}, ${readyMessage}
      </p>

      <div style="background:#fdf8f3;border:2px dashed #deb887;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#8b4513;letter-spacing:2px;">${order.orderNumber}</p>
      </div>

      <div style="text-align:center;padding:16px;background:${config.color}15;border-radius:12px;margin-bottom:24px;">
        <p style="margin:0;font-size:32px;">${config.emoji}</p>
        <p style="margin:8px 0 0;font-size:16px;font-weight:600;color:${config.color};">
          ${order.status.replace(/_/g, " ")}
        </p>
      </div>

      ${
        itemsHtml
          ? `<table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
              <tr>
                <th style="text-align:left;padding:8px 0;border-bottom:2px solid #8b4513;font-size:12px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Items</th>
                <th style="text-align:right;padding:8px 0;border-bottom:2px solid #8b4513;font-size:12px;color:#a08060;text-transform:uppercase;letter-spacing:1px;">Amount</th>
              </tr>
              ${itemsHtml}
            </table>`
          : ""
      }

      ${
        typeof order.total === "number"
          ? `<div style="border-top:2px solid #f0ebe5;padding-top:12px;margin-bottom:16px;">
              <table style="width:100%;border-collapse:collapse;">
                ${typeof order.subtotal === "number" ? `<tr><td style="padding:4px 0;font-size:14px;color:#78716c;">Subtotal</td><td style="padding:4px 0;font-size:14px;color:#3d1e08;text-align:right;">${formatCurrency(order.subtotal)}</td></tr>` : ""}
                ${(order.discount ?? 0) > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#16a34a;">Discount</td><td style="padding:4px 0;font-size:14px;color:#16a34a;text-align:right;">-${formatCurrency(order.discount as number)}</td></tr>` : ""}
                ${(order.deliveryFee ?? 0) > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#78716c;">Delivery Fee</td><td style="padding:4px 0;font-size:14px;color:#3d1e08;text-align:right;">${formatCurrency(order.deliveryFee as number)}</td></tr>` : ""}
                ${(order.tax ?? 0) > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#78716c;">Tax</td><td style="padding:4px 0;font-size:14px;color:#3d1e08;text-align:right;">${formatCurrency(order.tax as number)}</td></tr>` : ""}
                ${(order.tip ?? 0) > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#78716c;">Tip</td><td style="padding:4px 0;font-size:14px;color:#3d1e08;text-align:right;">${formatCurrency(order.tip as number)}</td></tr>` : ""}
                <tr>
                  <td style="padding:12px 0 4px;font-size:18px;font-weight:bold;color:#3d1e08;border-top:2px solid #8b4513;">Total</td>
                  <td style="padding:12px 0 4px;font-size:18px;font-weight:bold;color:#8b4513;text-align:right;border-top:2px solid #8b4513;">${formatCurrency(order.total)}</td>
                </tr>
              </table>
            </div>`
          : ""
      }

      ${
        order.estimatedReadyTime
          ? `<p style="margin:0 0 24px;text-align:center;font-size:14px;color:#78716c;">
              Estimated ready: ${new Date(order.estimatedReadyTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
            </p>`
          : ""
      }

      <div style="text-align:center;margin-top:16px;">
        <a href="${trackingUrl}"
           style="display:inline-block;padding:12px 32px;background:#8b4513;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">
          Track Your Order →
        </a>
      </div>
    </div>

    <div style="text-align:center;padding:24px 0;color:#a08060;font-size:12px;">
      <p style="margin:0;">Thank you for choosing Native Delicacies!</p>
      <p style="margin:4px 0 0;">Questions? Reply to this email or call us.</p>
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: order.customerEmail,
    subject: `${config.subject} — ${order.orderNumber} | Native Delicacies`,
    html,
  });
}
