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
          <div className="surface-woven rounded-[1.9rem] border border-latik/14 p-6 shadow-[var(--shadow-warm)]">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-pulot">Guides</p>
            <h2 className="mt-3 text-2xl font-black text-kape">Policies</h2>
            <nav className="mt-5 space-y-1.5">
              {POLICY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-[1rem] border border-transparent px-3 py-3 text-sm font-medium text-latik/78 transition-all duration-300 ease-in-out hover:border-pulot/18 hover:bg-pulot/8 hover:text-pulot"
                >
                  <span>{titles[link.slug]}</span>
                  <ChevronRight className="h-4 w-4 text-latik/34" strokeWidth={1.5} />
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="surface-woven rounded-[2rem] border border-latik/14 px-7 py-8 shadow-[var(--shadow-warm)] sm:px-10 sm:py-10">
            <div className="prose prose-stone max-w-none prose-headings:text-stone-900 prose-p:text-stone-600 prose-li:text-stone-600 prose-strong:text-stone-900">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
