"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, X, User, Search, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  UI_NAV_DROPDOWN_ITEM_CLASS,
  UI_NAV_ICON_BUTTON_CLASS,
  UI_NAV_MENU_ITEM_CLASS,
  UI_NAV_MOBILE_TOGGLE_CLASS,
  UI_NAV_TEXT_LINK_CLASS,
} from "@/lib/ui-classes";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/bilao-builder", label: "Bilao Builder" },
  { href: "/track", label: "Track Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleCart } = useUIStore();
  const { data: session, status } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navTextToneClass = isScrolled
    ? "text-kape/80 hover:text-pulot data-[active=true]:text-kape data-[active=true]:after:scale-x-100"
    : "text-kape/75 hover:text-pulot data-[active=true]:text-kape data-[active=true]:after:scale-x-100";
  const navIconToneClass = isScrolled
    ? "text-kape/70 hover:text-pulot"
    : "text-kape/75 hover:text-pulot";
  const mobileNavTextToneClass = isScrolled
    ? "text-kape/75 hover:text-pulot"
    : "text-kape/80 hover:text-pulot";
  const dropdownTextToneClass = "text-kape/75 hover:text-pulot";
  const navLinkInteractionClass =
    "hover:-translate-y-px hover:bg-kape/5 hover:shadow-[0_14px_26px_rgba(59,31,14,0.08)] focus-visible:bg-kape/5 focus-visible:text-pulot focus-visible:outline-none";
  const navIconInteractionClass =
    "border-latik/10 bg-asukal/70 shadow-[0_8px_18px_rgba(59,31,14,0.06)] hover:border-pulot/30 hover:bg-pulot/10 hover:shadow-[0_14px_24px_rgba(59,31,14,0.12)] focus-visible:border-pulot/40 focus-visible:outline-none active:scale-[0.98]";
  const actionIconClass = "h-[18px] w-[18px] sm:h-5 sm:w-5";

  const isLoggedIn = status === "authenticated" && session?.user;
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER" || session?.user?.role === "STAFF";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 16);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 py-2 transition-all duration-300 ease-out sm:py-3",
        pathname === "/" && "-mb-[68px] sm:-mb-20"
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-[calc(100%-1rem)] items-center justify-between px-3 transition-all duration-300 ease-out sm:w-[calc(100%-2rem)] sm:px-6 lg:px-8",
          isScrolled
            ? "h-14 max-w-6xl rounded-[1.85rem] border border-latik/20 bg-asukal/90 shadow-[0_18px_42px_rgba(59,31,14,0.16)] backdrop-blur-xl sm:h-[4.25rem]"
            : "h-16 max-w-7xl rounded-[1.7rem] border border-latik/15 bg-asukal/80 shadow-[0_14px_30px_rgba(59,31,14,0.10)] backdrop-blur-xl sm:h-[4.65rem]"
        )}
      >
        <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
          <span className="hidden h-10 w-px bg-latik/20 sm:block" aria-hidden="true" />
          <div className="flex flex-col leading-none">
            <span
              className={cn(
                "font-[family-name:var(--font-display)] text-[1rem] uppercase tracking-[0.26em] sm:text-[1.15rem]",
                isScrolled ? "text-kape" : "text-kape/95"
              )}
            >
              J&amp;J Native
            </span>
            <span className="mt-1 text-[0.52rem] uppercase tracking-[0.38em] text-latik/70 sm:text-[0.56rem]">
              Delicacies
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-active={
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`)
              }
              className={cn(UI_NAV_TEXT_LINK_CLASS, navTextToneClass, navLinkInteractionClass)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-0 sm:gap-0.5">
          <Link
            href="/menu"
            className={cn("hidden md:inline-flex", UI_NAV_ICON_BUTTON_CLASS, navIconToneClass, navIconInteractionClass)}
            aria-label="Search"
          >
            <Search className={actionIconClass} strokeWidth={1.5} />
          </Link>

          {isLoggedIn ? (
            <div className="relative hidden md:inline-flex" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn("flex items-center gap-2", UI_NAV_ICON_BUTTON_CLASS, navIconToneClass, navIconInteractionClass)}
                aria-label="Account menu"
              >
                <User className={actionIconClass} strokeWidth={1.5} />
                <span className="max-w-[96px] truncate text-[0.68rem] font-medium uppercase tracking-[0.18em] leading-none">
                  {session.user.name?.split(" ")[0]}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-[1.5rem] border border-latik/15 bg-asukal/95 p-2 shadow-[0_22px_40px_rgba(59,31,14,0.18)] backdrop-blur-xl">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className={cn(UI_NAV_DROPDOWN_ITEM_CLASS, dropdownTextToneClass)}
                  >
                    <Settings className="h-4 w-4" strokeWidth={1.5} /> My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn(UI_NAV_DROPDOWN_ITEM_CLASS, dropdownTextToneClass)}
                    >
                      <ShieldCheck className="h-4 w-4" strokeWidth={1.5} /> Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-2 border-latik/10" />
                  <button
                    onClick={async () => { setUserMenuOpen(false); await signOut({ redirect: false }); window.location.href = "/"; }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-red-800/85 transition-all duration-300 ease-in-out hover:bg-red-900/8"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={cn("hidden md:inline-flex", UI_NAV_ICON_BUTTON_CLASS, navIconToneClass, navIconInteractionClass)}
              aria-label="Account"
          >
              <User className={actionIconClass} strokeWidth={1.5} />
            </Link>
          )}

          <button
            onClick={toggleCart}
            className={cn("relative", UI_NAV_ICON_BUTTON_CLASS, navIconToneClass, navIconInteractionClass)}
            aria-label="Shopping cart"
          >
            <ShoppingCart className={actionIconClass} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pulot px-1 text-[9px] font-bold text-asukal shadow-[0_6px_14px_rgba(59,31,14,0.2)] sm:h-5 sm:min-w-5 sm:text-[10px]">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={toggleMobileMenu}
            className={cn("md:hidden", UI_NAV_MOBILE_TOGGLE_CLASS, navIconToneClass, navIconInteractionClass)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className={actionIconClass} strokeWidth={1.5} /> : <Menu className={actionIconClass} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "mx-auto w-[calc(100%-1rem)] overflow-hidden transition-all duration-300 ease-out sm:w-[calc(100%-2rem)] md:hidden",
          isScrolled
            ? "max-w-6xl rounded-b-[1.85rem] border-x border-b border-latik/15 bg-asukal/95 shadow-[0_20px_36px_rgba(59,31,14,0.14)] backdrop-blur-xl"
            : "max-w-7xl rounded-b-[1.6rem] border border-t-0 border-latik/12 bg-asukal/92 shadow-[0_16px_30px_rgba(59,31,14,0.10)] backdrop-blur-xl",
          isMobileMenuOpen
            ? "max-h-80 translate-y-0 opacity-100"
            : "max-h-0 -translate-y-1 opacity-0 pointer-events-none border-transparent"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              data-active={
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`)
              }
              className={cn(UI_NAV_MENU_ITEM_CLASS, mobileNavTextToneClass, navLinkInteractionClass)}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className={cn(UI_NAV_MENU_ITEM_CLASS, mobileNavTextToneClass, navLinkInteractionClass)}
              >
                My Account
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className={cn(UI_NAV_MENU_ITEM_CLASS, mobileNavTextToneClass, navLinkInteractionClass)}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={async () => { closeMobileMenu(); await signOut({ redirect: false }); window.location.href = "/"; }}
                className="rounded-2xl px-4 py-3 text-left text-[0.72rem] font-medium uppercase tracking-[0.22em] text-red-800/85 transition-all duration-300 ease-in-out hover:bg-red-900/8"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className={cn(UI_NAV_MENU_ITEM_CLASS, mobileNavTextToneClass, navLinkInteractionClass)}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

