const XENDIT_API_BASE_URL = "https://api.xendit.co";
const XENDIT_API_VERSION = "2024-11-11";

export class XenditApiError extends Error {
  status: number;
  code?: string | null;

  constructor(message: string, status: number, code?: string | null) {
    super(message);
    this.name = "XenditApiError";
    this.status = status;
    this.code = code;
  }
}

export interface XenditPaymentAction {
  type: string;
  descriptor: string;
  value: string;
}

export interface XenditPaymentRequest {
  payment_request_id: string;
  latest_payment_id?: string | null;
  reference_id: string;
  status:
    | "ACCEPTING_PAYMENTS"
    | "REQUIRES_ACTION"
    | "AUTHORIZED"
    | "CANCELED"
    | "EXPIRED"
    | "SUCCEEDED"
    | "FAILED";
  channel_code: string;
  actions?: XenditPaymentAction[];
  failure_code?: string | null;
  description?: string;
}

export interface XenditRefund {
  id: string;
  payment_request_id: string;
  reference_id: string;
  status: "SUCCEEDED" | "FAILED" | "PENDING" | "CANCELLED";
  failure_code?: string | null;
}

interface CreateGcashPaymentRequestInput {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: {
    id: string;
    name: string;
    quantity: number;
    priceAtOrder: number;
    imageUrl?: string | null;
  }[];
  successReturnUrl: string;
  failureReturnUrl: string;
}

function getXenditSecretKey() {
  const key = process.env.XENDIT_SECRET_KEY;

  if (!key) {
    throw new Error("XENDIT_SECRET_KEY is not set");
  }

  return key;
}

export function getXenditWebhookToken() {
  const token = process.env.XENDIT_WEBHOOK_TOKEN;

  if (!token) {
    throw new Error("XENDIT_WEBHOOK_TOKEN is not set");
  }

  return token;
}

function getAuthorizationHeader() {
  return `Basic ${Buffer.from(`${getXenditSecretKey()}:`).toString("base64")}`;
}

async function xenditRequest<TResponse>(
  path: string,
  init: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(`${XENDIT_API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
      "api-version": XENDIT_API_VERSION,
      ...init.headers,
    },
  });

  const bodyText = await response.text();
  let body: Record<string, unknown> = {};

  if (bodyText) {
    try {
      body = JSON.parse(bodyText) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }

  if (!response.ok) {
    const message =
      typeof body.message === "string"
        ? body.message
        : `Xendit request failed with status ${response.status}`;
    const code = typeof body.error_code === "string" ? body.error_code : null;
    throw new XenditApiError(message, response.status, code);
  }

  return body as TResponse;
}

export function extractXenditRedirectUrl(actions?: XenditPaymentAction[]) {
  if (!actions?.length) {
    return null;
  }

  return (
    actions.find((action) => action.descriptor === "WEB_URL")?.value ??
    actions.find((action) => action.descriptor === "DEEPLINK_URL")?.value ??
    null
  );
}

export async function createGcashPaymentRequest(
  input: CreateGcashPaymentRequestInput
) {
  return xenditRequest<XenditPaymentRequest>("/v3/payment_requests", {
    method: "POST",
    body: JSON.stringify({
      reference_id: input.orderId,
      type: "PAY",
      country: "PH",
      currency: "PHP",
      request_amount: Number(input.total.toFixed(2)),
      capture_method: "AUTOMATIC",
      channel_code: "GCASH",
      channel_properties: {
        success_return_url: input.successReturnUrl,
        failure_return_url: input.failureReturnUrl,
      },
      description: `GCash payment for order ${input.orderNumber}`,
      metadata: {
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
      },
      items: input.items.map((item) => ({
        reference_id: item.id,
        type: "PHYSICAL_PRODUCT",
        name: item.name,
        currency: "PHP",
        net_unit_amount: Number(item.priceAtOrder.toFixed(2)),
        quantity: item.quantity,
        image_url: item.imageUrl ?? undefined,
        category: "FOOD",
      })),
    }),
  });
}

export async function getXenditPaymentRequestStatus(paymentRequestId: string) {
  return xenditRequest<XenditPaymentRequest>(
    `/v3/payment_requests/${paymentRequestId}`,
    {
      method: "GET",
    }
  );
}

export async function createXenditRefund(input: {
  paymentRequestId: string;
  referenceId: string;
  amount: number;
}) {
  return xenditRequest<XenditRefund>("/refunds", {
    method: "POST",
    body: JSON.stringify({
      reference_id: input.referenceId,
      payment_request_id: input.paymentRequestId,
      currency: "PHP",
      amount: Number(input.amount.toFixed(2)),
      reason: "REQUESTED_BY_CUSTOMER",
      metadata: {
        refundSource: "customer_cancel_order",
      },
    }),
  });
}
