"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package } from "lucide-react";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (trimmed) {
      router.push(`/track/${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brown-100">
          <Package className="h-8 w-8 text-brown-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Track Your Order</h1>
        <p className="mt-2 text-stone-500">
          Enter the order number from your confirmation to see real-time status updates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ND-20250101-ABC1"
              className="w-full rounded-xl border border-stone-200 py-3 pl-10 pr-4 text-sm focus:border-brown-500 focus:outline-none focus:ring-1 focus:ring-brown-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-brown-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brown-700"
          >
            Track
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-stone-400">
        Your order number was shown on the confirmation page and sent to your email.
      </p>
    </div>
  );
}
