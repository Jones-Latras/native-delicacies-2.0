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
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-brown-600">J&J Native Delicacies</h3>
            <p className="mt-2 text-sm text-stone-500">
              Preserving Filipino culinary heritage, one delicacy at a time. Handcrafted kakanin and
              regional specialties made with love and tradition.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900">Shop</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-500 hover:text-brown-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-900">
              Policies
            </h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.policies.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-500 hover:text-brown-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-200 pt-6 text-center">
          <p className="text-sm text-stone-400">
            &copy; {new Date().getFullYear()} J&J Native Delicacies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

