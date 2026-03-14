"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, X, User, Search, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/bilao-builder", label: "Bilao Builder" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleCart } = useUIStore();
  const { data: session, status } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <span className="text-xl font-bold tracking-tight text-brown-600">
            Native Delicacies
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-brown-50 hover:text-brown-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/menu"
            className="hidden rounded-lg p-2 text-stone-500 hover:bg-brown-50 hover:text-brown-700 md:inline-flex"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          {isLoggedIn ? (
            <div className="relative hidden md:inline-flex" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg p-2 text-stone-500 hover:bg-brown-50 hover:text-brown-700"
                aria-label="Account menu"
              >
                <User className="h-5 w-5" />
                <span className="max-w-[100px] truncate text-xs font-medium">
                  {session.user.name?.split(" ")[0]}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-brown-50 hover:text-brown-700"
                  >
                    <Settings className="h-4 w-4" /> My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-brown-50 hover:text-brown-700"
                    >
                      <ShieldCheck className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-1 border-stone-100" />
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
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
              className="hidden rounded-lg p-2 text-stone-500 hover:bg-brown-50 hover:text-brown-700 md:inline-flex"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          <button
            onClick={toggleCart}
            className="relative rounded-lg p-2 text-stone-500 hover:bg-brown-50 hover:text-brown-700"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brown-600 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={toggleMobileMenu}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-stone-200 bg-white transition-all duration-200 md:hidden",
          isMobileMenuOpen ? "max-h-80" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-brown-50 hover:text-brown-700"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-brown-50 hover:text-brown-700"
              >
                My Account
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-brown-50 hover:text-brown-700"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { closeMobileMenu(); signOut({ callbackUrl: "/" }); }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-brown-50 hover:text-brown-700"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
