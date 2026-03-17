import Link from "next/link";
import { Truck, RefreshCw, Shield, FileText } from "lucide-react";
import { getPolicyTitles } from "@/lib/policy-content";

export const dynamic = "force-dynamic";

const POLICIES = [
  { href: "/policies/delivery", slug: "delivery", icon: Truck, description: "Our delivery coverage, fees, and estimated delivery times." },
  { href: "/policies/refund", slug: "refund", icon: RefreshCw, description: "How to cancel orders and request refunds." },
  { href: "/policies/privacy", slug: "privacy", icon: Shield, description: "How we collect, use, and protect your personal data." },
  { href: "/policies/terms", slug: "terms", icon: FileText, description: "The rules and guidelines governing use of our services." },
];

export default async function PoliciesIndexPage() {
  const titles = await getPolicyTitles();

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-900">Our Policies</h1>
      <p className="mt-2 text-stone-500">
        Transparency is important to us. Please review our policies below.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {POLICIES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="flex items-start gap-4 rounded-xl border border-stone-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <p.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">{titles[p.slug]}</h3>
              <p className="mt-1 text-sm text-stone-500">{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
