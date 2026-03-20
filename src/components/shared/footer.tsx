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
    <footer className="relative overflow-hidden border-t border-latik/40 bg-kape text-asukal/78">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(194,133,42,0.28),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-pulot/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.18em] text-asukal">
              J&amp;J Native Delicacies
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-asukal/72">
              Preserving Filipino culinary heritage, one delicacy at a time. Handcrafted kakanin and
              regional specialties made with love and tradition.
            </p>
          </div>

          <div>
            <h4 className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-pulot">Shop</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-asukal/72 hover:text-pulot">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-pulot">
              Policies
            </h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.policies.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-asukal/72 hover:text-pulot">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-latik/35 pt-6 text-center">
          <p className="text-sm text-asukal/56">
            &copy; {new Date().getFullYear()} J&J Native Delicacies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

