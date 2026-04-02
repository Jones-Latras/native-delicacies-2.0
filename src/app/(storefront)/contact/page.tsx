import { prisma } from "@/lib/prisma";
import { getDefaultContactPageContent, parseContactPageContent } from "@/lib/contact-content";
import { ContactClient } from "./contact-client";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [contentPage, businessSettings] = await Promise.all([
    prisma.contentPage.findUnique({
      where: { slug: "contact" },
      select: { title: true, content: true },
    }),
    prisma.businessSettings.findUnique({
      where: { id: "default" },
      select: {
        phone: true,
        email: true,
        address: true,
        operatingHours: true,
      },
    }),
  ]);

  const contactContent = parseContactPageContent(contentPage ?? { title: getDefaultContactPageContent().hero.title, content: "" });

  return (
    <ContactClient
      content={contactContent}
      contactSettings={
        businessSettings
          ? {
              phone: businessSettings.phone || undefined,
              email: businessSettings.email || undefined,
              address:
                businessSettings.address && typeof businessSettings.address === "object"
                  ? (businessSettings.address as {
                      street?: string;
                      city?: string;
                      state?: string;
                      postalCode?: string;
                    })
                  : undefined,
              operatingHours:
                businessSettings.operatingHours && typeof businessSettings.operatingHours === "object"
                  ? (businessSettings.operatingHours as Record<
                      string,
                      { isClosed: boolean; slots: { open: string; close: string }[] }
                    >)
                  : undefined,
            }
          : null
      }
    />
  );
}
