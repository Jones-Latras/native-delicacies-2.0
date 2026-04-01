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
    <div className="flex h-full flex-col justify-between py-8">
      <div>
        <div className="mb-10 flex items-center gap-3 px-8">
          <UtensilsCrossed className="h-5 w-5 text-pulot" strokeWidth={1.5} />
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[0.18em] leading-tight text-kape">
              J&amp;J Native
            </h1>
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-latik/66">
              Admin Portal
            </p>
          </div>
        </div>

        <nav className="space-y-1 px-0">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 border-l-2 px-8 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition-colors duration-200 ease-out",
                  active
                    ? "border-pulot text-kape"
                    : "border-transparent text-latik/72 hover:border-latik/22 hover:text-kape"
                )}
              >
                <item.icon className={cn("h-5 w-5", active ? "text-pulot" : "text-latik/55")} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-latik/12 px-8 pt-5">
        <button
          onClick={async () => { await signOut({ redirect: false }); window.location.href = "/admin/login"; }}
          className="flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-latik/72 transition-colors duration-200 ease-out hover:text-kape"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(255,250,242,0.92),rgba(245,236,215,0.98))] font-[family-name:var(--font-body)] text-kape">
      <aside className="sticky top-0 hidden h-screen w-72 flex-shrink-0 border-r border-latik/12 lg:block">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-kape/45 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 h-full w-72 border-r border-latik/12 bg-[linear-gradient(180deg,rgba(255,250,242,0.96),rgba(245,236,215,0.98))]">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-5 top-5 text-latik/70 transition-colors duration-200 ease-out hover:text-pulot"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-latik/12 bg-[linear-gradient(180deg,rgba(255,250,242,0.9),rgba(255,250,242,0.72))] px-6 backdrop-blur-md lg:h-20 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-latik transition-colors duration-200 ease-out hover:text-pulot lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="relative hidden max-w-xl sm:block sm:flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-latik/45" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search orders, customers, or items..."
                className="w-full border-b border-latik/18 bg-transparent py-2.5 pl-11 pr-4 text-sm text-kape placeholder:text-latik/42 focus:border-pandan focus:outline-none"
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
              <div className="flex h-11 w-11 items-center justify-center border border-pulot/20 text-sm font-bold text-latik">
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
