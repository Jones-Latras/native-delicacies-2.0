"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { SurfaceCard } from "@/components/ui";

interface PaymentStatusResponse {
  id: string;
  orderNumber: string;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentRequestId: string | null;
  paymentRequestStatus: string;
  checkoutUrl: string | null;
  failureCode: string | null;
}

export function XenditPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [session, setSession] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPaymentSession = useCallback(
    async (isRefresh = false) => {
      if (!orderId) {
        setError("This payment link is invalid or has expired.");
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(`/api/orders/${orderId}/payment-status`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.error || "Failed to load your GCash payment session.");
          setSession(null);
          return;
        }

        const data = result.data as PaymentStatusResponse;
        setSession(data);
        setError("");

        if (data.paymentStatus === "PAID") {
          router.replace(`/order/${orderId}/confirmation?paymentReturn=success`);
        }
      } catch {
        setError("Failed to load your GCash payment session.");
        setSession(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId, router]
  );

  useEffect(() => {
    loadPaymentSession();
  }, [loadPaymentSession]);

  useEffect(() => {
    if (
      session?.paymentStatus === "PENDING" &&
      session.checkoutUrl &&
      !error
    ) {
      const timeout = window.setTimeout(() => {
        window.location.assign(session.checkoutUrl);
      }, 1200);

      return () => window.clearTimeout(timeout);
    }
  }, [error, session]);

  if (loading) {
    return (
      <div className="artisan-payment mx-auto max-w-lg px-4 py-16 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-brown-600" />
        <p className="mt-4 text-sm text-stone-500">
          Preparing your GCash checkout...
        </p>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="artisan-payment mx-auto max-w-lg px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h1 className="mt-4 text-xl font-bold text-stone-900">
          Invalid Payment Link
        </h1>
        <p className="mt-2 text-stone-500">
          This payment link is invalid or has expired.
        </p>
      </div>
    );
  }

  const isFailed = session?.paymentStatus === "FAILED";
  const isPaid = session?.paymentStatus === "PAID";

  return (
    <div className="artisan-payment mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="text-center">
        {isFailed ? (
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        ) : (
          <ShieldCheck className="mx-auto h-10 w-10 text-green-600" />
        )}
        <h1 className="mt-3 text-2xl font-bold text-stone-900">
          {isFailed ? "GCash Payment Failed" : "Continue to GCash"}
        </h1>
        <p className="mt-1 text-stone-500">
          {isFailed
            ? "Your order was created, but the payment did not go through."
            : isPaid
              ? "Your payment is already confirmed."
              : "We'll send you to Xendit's secure GCash checkout."}
        </p>
      </div>

      <SurfaceCard className="mt-8 p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brown-100 text-brown-700">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-900">
              Order {session?.orderNumber ?? ""}
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              {session?.checkoutUrl
                ? "If nothing happens automatically, use the button below to continue."
                : "Refresh the payment session to get the latest GCash status."}
            </p>
            {session?.failureCode && (
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-red-500">
                Failure code: {session.failureCode}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {session?.checkoutUrl && session.paymentStatus === "PENDING" && (
            <a
              href={session.checkoutUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brown-600 py-3.5 font-semibold text-white transition-colors hover:bg-brown-700"
            >
              Open GCash Checkout
            </a>
          )}

          <button
            type="button"
            onClick={() => loadPaymentSession(true)}
            disabled={refreshing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3.5 font-semibold text-stone-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Check Payment Status"
            )}
          </button>

          <Link
            href={`/order/${orderId}/confirmation`}
            className="flex w-full items-center justify-center rounded-xl border border-stone-200 py-3.5 font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            View Order Status
          </Link>
        </div>
      </SurfaceCard>

      <p className="mt-4 text-center text-xs text-stone-400">
        Secured by Xendit. You&apos;ll complete the payment in the hosted GCash flow.
      </p>
    </div>
  );
}
