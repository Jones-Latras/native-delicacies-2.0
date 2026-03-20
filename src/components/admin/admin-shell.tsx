"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  Users,
  Tag,
  Shield,
  UtensilsCrossed,
  FileText,
} from "lucide-react";
import { NotificationPanel } from "./notification-panel";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/menu", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Staff", icon: Shield },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(item: (typeof NAV_ITEMS)[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const sidebar = (
    <div className="flex h-full flex-col justify-between py-6">
      <div>
        <div className="mb-8 flex items-center gap-3 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pulot text-asukal shadow-[0_16px_28px_rgba(59,31,14,0.18)]">
            <UtensilsCrossed className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[0.18em] leading-tight text-kape">
              J&amp;J Native
            </h1>
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-latik/66">
              Admin Portal
            </p>
          </div>
        </div>

        <nav className="space-y-1.5 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-[1.15rem] border px-3.5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-all duration-300 ease-in-out",
                  active
                    ? "border-pulot/30 bg-gradient-to-r from-pulot/18 to-latik/6 text-kape shadow-[0_14px_28px_rgba(59,31,14,0.10)]"
                    : "border-transparent text-latik/80 hover:border-latik/15 hover:bg-gatas/70 hover:text-kape"
                )}
              >
                <item.icon className={cn("h-5 w-5", active ? "text-pulot" : "text-latik/55")} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 px-3">
        <button
          onClick={async () => { await signOut({ redirect: false }); window.location.href = "/admin/login"; }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-latik/18 bg-asukal/70 px-4 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik transition-all duration-300 ease-in-out hover:border-pulot/30 hover:bg-pulot/10 hover:text-kape"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(255,250,242,0.92),rgba(245,236,215,0.98))] font-[family-name:var(--font-body)] text-kape">
      <aside className="hidden w-72 flex-shrink-0 border-r border-latik/12 bg-asukal/88 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-kape/45 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 h-full w-72 border-r border-latik/12 bg-asukal/95 backdrop-blur-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-latik/12 bg-asukal p-2 text-latik/70 transition-all duration-300 ease-in-out hover:border-pulot/30 hover:bg-pulot/10 hover:text-pulot"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-latik/12 bg-asukal/82 px-6 shadow-[0_16px_30px_rgba(59,31,14,0.05)] backdrop-blur-xl lg:h-20 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-full border border-latik/15 bg-asukal p-2.5 text-latik transition-all duration-300 ease-in-out hover:border-pulot/30 hover:bg-pulot/10 hover:text-pulot lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="relative hidden max-w-xl sm:block sm:flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-latik/45" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search orders, customers, or items..."
                className="w-full rounded-full border border-latik/12 bg-gatas/90 py-2.5 pl-11 pr-4 text-sm text-kape placeholder:text-latik/42 focus:border-pandan focus:outline-none focus:ring-2 focus:ring-pandan/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationPanel />
            <div className="mx-2 hidden h-10 w-px bg-latik/10 sm:block" />
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold leading-none text-kape">{session?.user?.name ?? "Admin"}</p>
                <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-latik/62">Store Manager</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-pulot/25 bg-pulot/14 text-sm font-bold text-latik shadow-[0_12px_20px_rgba(59,31,14,0.06)]">
                {(session?.user?.name ?? "A").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="artisan-admin p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
