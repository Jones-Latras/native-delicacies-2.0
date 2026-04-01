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
    <div className="artisan-track mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="border-b border-latik/14 px-8 pb-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brown-100">
          <Package className="h-8 w-8 text-brown-600" />
        </div>
        <p className="mt-5 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-pulot">Live Updates</p>
        <h1 className="mt-3 text-3xl font-black text-kape sm:text-4xl">Track Your Order</h1>
        <p className="mt-3 leading-7 text-latik/74">
          Enter the order number from your confirmation to see real-time status updates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex gap-2 border-t border-latik/14 pt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ND-20250101-ABC1"
              className="w-full border-b border-stone-200 bg-transparent py-3 pl-10 pr-4 text-sm focus:border-brown-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="border-b-2 border-brown-600 px-3 py-3 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-brown-600 transition-colors duration-300 ease-in-out hover:text-brown-700"
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
