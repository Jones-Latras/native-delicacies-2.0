"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { SurfaceCard } from "@/components/ui";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function StripePaymentClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clientSecret = searchParams.get("clientSecret");

  if (!orderId || !clientSecret) {
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

  return (
    <div className="artisan-payment mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-green-600" />
        <h1 className="mt-3 text-2xl font-bold text-stone-900">
          Complete GCash Payment
        </h1>
        <p className="mt-1 text-stone-500">
          Finish your payment to complete the order
        </p>
      </div>

      <SurfaceCard className="mt-8 p-6">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#8b4513",
                borderRadius: "8px",
              },
            },
          }}
        >
          <PaymentForm orderId={orderId} />
        </Elements>
      </SurfaceCard>

      <p className="mt-4 text-center text-xs text-stone-400">
        Secured by Stripe. Your payment details never touch our servers.
      </p>
    </div>
  );
}

function PaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}/confirmation`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed. Please try again.");
      setProcessing(false);
      return;
    }

    // Payment succeeded without redirect (e.g., no 3DS)
    clearCart();
    router.push(`/order/${orderId}/confirmation`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brown-600 py-3.5 font-semibold text-white transition-colors hover:bg-brown-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
}
