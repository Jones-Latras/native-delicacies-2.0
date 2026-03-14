import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { CartPanel } from "@/components/storefront/cart-panel";
import { CartSync } from "@/components/storefront/cart-sync";
import { AnnouncementBanner } from "@/components/shared/announcement-banner";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartPanel />
      <CartSync />
    </div>
  );
}
