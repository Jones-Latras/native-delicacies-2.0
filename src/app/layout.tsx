import type { Metadata, Viewport } from "next";
import { DM_Sans, Lora, Playfair_Display } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/components/shared/auth-provider";
import { ServiceWorkerRegistration } from "@/components/shared/sw-register";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#7C4A1E",
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
        className={`${playfairDisplay.variable} ${lora.variable} ${dmSans.variable} ${geistMono.variable} antialiased`}
        style={
          {
            "--font-display": playfairDisplay.style.fontFamily,
            "--font-body": lora.style.fontFamily,
            "--font-label": dmSans.style.fontFamily,
          } as CSSProperties
        }
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

