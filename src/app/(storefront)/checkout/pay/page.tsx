import { Suspense } from "react";
import { StripePaymentClient } from "./stripe-payment-client";

export const metadata = {
  title: "Complete GCash Payment | J&J Native Delicacies",
  description: "Complete your GCash payment",
};

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-brown-600" />
        </div>
      }
    >
      <StripePaymentClient />
    </Suspense>
  );
}

