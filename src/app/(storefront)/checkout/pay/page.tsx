import { Suspense } from "react";
import { XenditPaymentClient } from "./xendit-payment-client";

export const metadata = {
  title: "Complete GCash Payment | J&J Native Delicacies",
  description: "Continue to Xendit to complete your GCash payment",
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
      <XenditPaymentClient />
    </Suspense>
  );
}

