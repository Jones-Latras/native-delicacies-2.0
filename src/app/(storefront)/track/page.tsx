"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search } from "lucide-react";

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
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF6F0_100%)] px-4 py-16 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
      <div className="pointer-events-none absolute left-[12%] top-16 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.65),transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-8 right-[12%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(160,82,45,0.10),transparent_72%)]" />

      <div className="relative mx-auto max-w-3xl">
        <div className="rounded-[28px] border border-[#C9A87C] bg-[#FFFDF8] px-8 py-12 text-center shadow-[0_24px_50px_rgba(90,50,20,0.08)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5E6C8] text-[#A0522D]">
            <Package className="h-8 w-8" strokeWidth={1.7} />
          </div>
          <p className="mt-5 font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
            Live Updates
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012] sm:text-[3rem]">
            Track Your Order
          </h1>
          <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
          <p className="mx-auto mt-5 max-w-xl font-[family-name:var(--font-label)] text-base italic leading-7 text-[#7A6A55]">
            Enter the order number from your confirmation to see real-time status updates.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A6A55]"
                  strokeWidth={1.7}
                />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ND-20250101-ABC1"
                  className="w-full rounded-[14px] border border-[#C9A87C] bg-[#FAF6F0] py-3 pl-12 pr-4 font-[family-name:var(--font-label)] text-sm text-[#3E2012] transition-colors duration-200 ease-in-out placeholder:text-[#7A6A55] focus:border-[#A0522D] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-[#A0522D] px-6 py-3 font-[family-name:var(--font-label)] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#7D3D1A]"
              >
                Track Order
              </button>
            </div>
          </form>

          <p className="mt-6 font-[family-name:var(--font-label)] text-xs text-[#7A6A55]">
            Your order number was shown on the confirmation page and sent to your email.
          </p>
        </div>
      </div>
    </section>
  );
}
