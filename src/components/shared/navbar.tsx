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
    ? "text-[#5e4736] hover:text-[#7a4822]"
    : "text-[#4f3a2b] hover:text-[#6f3f1c]";
  const navIconToneClass = isScrolled
    ? "text-[#6d5848] hover:text-[#7a4822]"
    : "text-[#5c4738] hover:text-[#6f3f1c]";
  const mobileNavTextToneClass = isScrolled
    ? "text-[#5a4434] hover:text-[#7a4822]"
    : "text-[#4d392b] hover:text-[#6f3f1c]";
  const dropdownTextToneClass = "text-[#5a4434] hover:text-[#724220]";
  const navLinkInteractionClass =
    "hover:bg-[rgba(125,75,35,0.08)] focus-visible:bg-[rgba(125,75,35,0.08)] focus-visible:text-[#6f3f1c]";
  const navIconInteractionClass =
    "p-1.5 sm:p-2 hover:bg-[rgba(125,75,35,0.09)] focus-visible:bg-[rgba(125,75,35,0.09)] active:scale-[0.98]";
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
        "sticky top-0 z-40 py-1 transition-all duration-300 ease-out sm:py-1.5",
        pathname === "/" && "-mb-[68px] sm:-mb-20"
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-[calc(100%-0.75rem)] items-center justify-between px-3 transition-all duration-300 ease-out sm:w-[calc(100%-1.5rem)] sm:px-6 lg:px-8",
          isScrolled
            ? "h-12 max-w-5xl rounded-2xl border border-[#e8d5bf] bg-[#fffaf6] shadow-[0_8px_20px_rgba(123,72,25,0.08)] backdrop-blur-lg sm:h-14"
            : "h-14 max-w-7xl rounded-xl border border-[#efdfcc] bg-[#fff9f2] shadow-[0_6px_14px_rgba(123,72,25,0.06)] backdrop-blur-xl sm:h-[3.75rem]"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <span className={cn("text-lg font-bold tracking-tight sm:text-xl", isScrolled ? "text-[#6f3f1d]" : "text-[#5a2f14]")}>
            J&J Native Delicacies
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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
            <Search className={actionIconClass} strokeWidth={2.1} />
          </Link>

          {isLoggedIn ? (
            <div className="relative hidden md:inline-flex" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn("flex items-center gap-1.5", UI_NAV_ICON_BUTTON_CLASS, navIconToneClass, navIconInteractionClass)}
                aria-label="Account menu"
              >
                <User className={actionIconClass} strokeWidth={2.1} />
                <span className="max-w-[96px] truncate text-xs font-medium leading-none">
                  {session.user.name?.split(" ")[0]}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-[rgba(226,199,170,0.42)] bg-[rgba(255,251,247,0.98)] py-1 shadow-[0_10px_20px_rgba(123,72,25,0.10)]">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className={cn(UI_NAV_DROPDOWN_ITEM_CLASS, dropdownTextToneClass)}
                  >
                    <Settings className="h-4 w-4" /> My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn(UI_NAV_DROPDOWN_ITEM_CLASS, dropdownTextToneClass)}
                    >
                      <ShieldCheck className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-1 border-stone-100" />
                  <button
                    onClick={async () => { setUserMenuOpen(false); await signOut({ redirect: false }); window.location.href = "/"; }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
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
              <User className={actionIconClass} strokeWidth={2.1} />
            </Link>
          )}

          <button
            onClick={toggleCart}
            className={cn("relative", UI_NAV_ICON_BUTTON_CLASS, navIconToneClass, navIconInteractionClass)}
            aria-label="Shopping cart"
          >
            <ShoppingCart className={actionIconClass} strokeWidth={2.1} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brown-600 text-[9px] font-bold text-white sm:h-5 sm:w-5 sm:text-[10px]">
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
            {isMobileMenuOpen ? <X className={actionIconClass} strokeWidth={2.1} /> : <Menu className={actionIconClass} strokeWidth={2.1} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "mx-auto w-[calc(100%-0.75rem)] overflow-hidden transition-all duration-300 ease-out sm:w-[calc(100%-1.5rem)] md:hidden",
          isScrolled
            ? "max-w-5xl rounded-b-2xl border-x border-b border-[#e8d5bf] bg-[#fffaf6] shadow-[0_14px_28px_rgba(123,72,25,0.09)] backdrop-blur-lg"
            : "max-w-7xl border-t border-[#efdfcc] bg-[#fff9f2] backdrop-blur-xl",
          isMobileMenuOpen
            ? "max-h-80 translate-y-0 opacity-100"
            : "max-h-0 -translate-y-1 opacity-0 pointer-events-none border-transparent"
        )}
      >
        <nav className="flex flex-col px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
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
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
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

