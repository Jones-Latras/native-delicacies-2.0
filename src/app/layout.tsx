import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/components/shared/auth-provider";
import { ServiceWorkerRegistration } from "@/components/shared/sw-register";
import "./globals.css";

const vietnamPro = Be_Vietnam_Pro({
  variable: "--font-vietnam-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#8b4513",
};

export const metadata: Metadata = {
  title: {
    default: "J&J Native Delicacies — Filipino Heritage Treats",
    template: "%s | J&J Native Delicacies",
  },
  description:
    "Order authentic J&J Native Delicacies online. Kakanin, regional specialties, and heritage snacks crafted with tradition and love.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "J&J Native Delicacies",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${vietnamPro.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <ToastProvider />
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  );
}

