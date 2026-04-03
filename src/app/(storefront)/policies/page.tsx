import Link from "next/link";
import { Truck, RefreshCw, Shield, FileText } from "lucide-react";
import { getPolicyTitles } from "@/lib/policy-content.server";

export const dynamic = "force-dynamic";

const POLICIES = [
  { href: "/policies/delivery", slug: "delivery", icon: Truck, description: "Our delivery coverage, fees, and estimated delivery times." },
  { href: "/policies/refund", slug: "refund", icon: RefreshCw, description: "How to cancel orders and request refunds." },
  { href: "/policies/privacy", slug: "privacy", icon: Shield, description: "How we collect, use, and protect your personal data." },
  { href: "/policies/terms", slug: "terms", icon: FileText, description: "The rules and guidelines governing use of our services." },
] as const;

export default async function PoliciesIndexPage() {
  const titles = await getPolicyTitles();

  return (
    <div className="space-y-10">
      <div className="surface-woven rounded-[2rem] border border-[#C9A87C]/70 bg-[#FFF8EE]/96 px-7 py-8 shadow-[0_24px_44px_rgba(62,32,18,0.12)] backdrop-blur-sm sm:px-10 sm:py-10">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#A0522D]">Shop Information</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[#3E2012] sm:text-[2.85rem]">
          Our Policies
        </h1>
        <div className="mt-4 h-0.5 w-16 rounded-full bg-[#A0522D]" />
        <p className="mt-5 max-w-2xl text-[1rem] italic leading-8 text-[#7A6A55]">
          Transparency is important to us. Please review our policies below.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {POLICIES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="surface-woven flex items-start gap-4 rounded-[1.6rem] border border-[#C9A87C]/65 bg-[#FFFDF8]/96 p-6 shadow-[0_16px_30px_rgba(62,32,18,0.08)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[#A0522D] hover:shadow-[0_20px_38px_rgba(59,31,14,0.14)]"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#F5E6C8] text-[#A0522D]">
              <p.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-[1.2rem] text-[#3E2012]">
                {titles[p.slug]}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#7A6A55]">{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
