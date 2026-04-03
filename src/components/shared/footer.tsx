import Link from "next/link";

const footerLinks = {
  shop: [
    { href: "/menu", label: "All Products" },
    { href: "/menu?sort=popular", label: "Popular Delicacies" },
    { href: "/bilao-builder", label: "Build Your Bilao" },
  ],
  policies: [
    { href: "/policies/delivery", label: "Delivery Info" },
    { href: "/policies/refund", label: "Refund Policy" },
    { href: "/policies/privacy", label: "Privacy Policy" },
    { href: "/policies/terms", label: "Terms & Conditions" },
  ],
};

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#8C6038] bg-[linear-gradient(180deg,#4A2816_0%,#341A0E_100%)] text-[#F8EBDD]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(201,168,124,0.24),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,230,200,0.7),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#A0522D]/12 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-10 h-56 w-56 rounded-full bg-[#C9A87C]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.75fr)_minmax(0,0.85fr)]">
          <div className="max-w-xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#F2D6AC] [text-shadow:0_1px_8px_rgba(0,0,0,0.18)]">
              Heritage Kitchen
            </p>
            <h3
              className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.22)] sm:text-[2.3rem]"
              style={{ color: "#FFFDF8" }}
            >
              J&amp;J Native Delicacies
            </h3>
            <div className="mt-4 h-0.5 w-16 rounded-full bg-[#A0522D]" />
            <p className="mt-5 max-w-md text-sm leading-8 text-[#F3E4D1]/82 sm:text-[0.96rem]">
              Preserving Filipino culinary heritage, one delicacy at a time. Handcrafted kakanin and
              regional specialties made with love, memory, and tradition.
            </p>
          </div>

          <div>
            <h4
              className="text-[0.72rem] font-bold uppercase tracking-[0.28em] [text-shadow:0_1px_10px_rgba(0,0,0,0.2)]"
              style={{ color: "#FFF1D8" }}
            >
              Shop
            </h4>
            <ul className="mt-5 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center text-[0.96rem] text-[#F8EBDD]/82 transition-all duration-200 ease-out hover:translate-x-1 hover:text-[#E2BE8B]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-[0.72rem] font-bold uppercase tracking-[0.28em] [text-shadow:0_1px_10px_rgba(0,0,0,0.2)]"
              style={{ color: "#FFF1D8" }}
            >
              Policies
            </h4>
            <ul className="mt-5 space-y-3">
              {footerLinks.policies.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center text-[0.96rem] text-[#F8EBDD]/82 transition-all duration-200 ease-out hover:translate-x-1 hover:text-[#E2BE8B]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm text-[#F3E4D1]/72">
            &copy; {new Date().getFullYear()} J&amp;J Native Delicacies. All rights reserved.
          </p>
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.2em] text-[#D8B27D]/72">
            Handcrafted from our humble kubo kitchen
          </p>
        </div>
      </div>
    </footer>
  );
}
