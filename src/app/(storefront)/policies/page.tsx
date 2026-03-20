import Link from "next/link";
import { Truck, RefreshCw, Shield, FileText } from "lucide-react";
import { getPolicyTitles } from "@/lib/policy-content";

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
      <div className="surface-woven rounded-[2rem] border border-latik/14 px-7 py-8 shadow-[var(--shadow-warm)] sm:px-10 sm:py-10">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-pulot">Shop Information</p>
        <h1 className="mt-3 text-4xl font-black text-kape">Our Policies</h1>
        <p className="mt-4 max-w-2xl leading-8 text-latik/76">
          Transparency is important to us. Please review our policies below.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {POLICIES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="surface-woven flex items-start gap-4 rounded-[1.6rem] border border-latik/14 p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(59,31,14,0.14)]"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pulot/12 text-pulot">
              <p.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-kape">{titles[p.slug]}</h3>
              <p className="mt-1 text-sm leading-7 text-latik/72">{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
