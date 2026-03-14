import Link from "next/link";
import { ChevronRight } from "lucide-react";

const POLICY_LINKS = [
  { href: "/policies/delivery", label: "Delivery Areas & Fees" },
  { href: "/policies/refund", label: "Refund & Cancellation" },
  { href: "/policies/privacy", label: "Privacy Policy" },
  { href: "/policies/terms", label: "Terms & Conditions" },
];

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-900">Policies</h2>
          <nav className="mt-4 space-y-1">
            {POLICY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-stone-300" />
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="prose prose-stone max-w-none prose-headings:text-stone-900 prose-p:text-stone-600 prose-li:text-stone-600 prose-strong:text-stone-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
