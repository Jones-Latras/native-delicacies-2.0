import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPolicyTitles } from "@/lib/policy-content.server";

export const dynamic = "force-dynamic";

const POLICY_LINKS = [
  { href: "/policies/delivery", slug: "delivery" },
  { href: "/policies/refund", slug: "refund" },
  { href: "/policies/privacy", slug: "privacy" },
  { href: "/policies/terms", slug: "terms" },
] as const;

export default async function PoliciesLayout({ children }: { children: React.ReactNode }) {
  const titles = await getPolicyTitles();

  return (
    <div className="artisan-policy-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="surface-woven rounded-[1.9rem] border border-[#C9A87C]/70 bg-[#FFF8EE]/96 p-6 shadow-[0_20px_40px_rgba(62,32,18,0.12)] backdrop-blur-sm">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#A0522D]">Shop Policies</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[#3E2012]">
              J&amp;J Native Delicacies
            </h2>
            <div className="mt-4 h-0.5 w-14 rounded-full bg-[#A0522D]" />
            <p className="mt-4 text-sm leading-7 text-[#7A6A55]">
              Review delivery, refunds, privacy, and store terms before placing your order.
            </p>
            <nav className="mt-6 space-y-2">
              {POLICY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-[1rem] border border-[#C9A87C]/55 bg-[#FAF6F0] px-4 py-3 text-sm font-medium text-[#5C3D1E] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#A0522D] hover:bg-[#FFFDF8] hover:text-[#3E2012] hover:shadow-[0_14px_28px_rgba(90,50,20,0.08)]"
                >
                  <span>{titles[link.slug]}</span>
                  <ChevronRight className="h-4 w-4 text-[#A0522D]/70" strokeWidth={1.5} />
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="surface-woven rounded-[2rem] border border-[#C9A87C]/70 bg-[#FFFDF8]/96 px-7 py-8 shadow-[0_24px_44px_rgba(62,32,18,0.12)] backdrop-blur-sm sm:px-10 sm:py-10">
            <div className="prose prose-stone max-w-none">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
