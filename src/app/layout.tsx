import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import { AuthProvider } from "@/components/shared/auth-provider";
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

export const metadata: Metadata = {
  title: {
    default: "Native Delicacies — Filipino Heritage Treats",
    template: "%s | Native Delicacies",
  },
  description:
    "Order authentic Filipino native delicacies online. Kakanin, regional specialties, and heritage snacks crafted with tradition and love.",
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
        </AuthProvider>
      </body>
    </html>
  );
}
