"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, User } from "lucide-react";
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

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <span className="text-xl font-bold tracking-tight text-amber-800">
            Native Delicacies
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900 md:inline-flex"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>

          <button
            onClick={toggleCart}
            className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={toggleMobileMenu}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
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
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={closeMobileMenu}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            My Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
