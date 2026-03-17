import { prisma } from "@/lib/prisma";

export const POLICY_SLUGS = ["delivery", "refund", "privacy", "terms"] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];

export const POLICY_FALLBACK_TITLES: Record<PolicySlug, string> = {
  delivery: "Delivery Areas & Fees",
  refund: "Refund & Cancellation",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

interface PolicyPageRecord {
  slug: string;
  title: string;
  content: string;
}

export async function getPolicyTitles(): Promise<Record<PolicySlug, string>> {
  const pages = await prisma.contentPage.findMany({
    where: { slug: { in: [...POLICY_SLUGS] } },
    select: { slug: true, title: true },
  });

  const titles: Record<PolicySlug, string> = { ...POLICY_FALLBACK_TITLES };
  for (const page of pages) {
    if (page.slug in titles) {
      titles[page.slug as PolicySlug] = page.title;
    }
  }

  return titles;
}

export async function getPolicyContentPage(slug: PolicySlug): Promise<PolicyPageRecord | null> {
  return prisma.contentPage.findUnique({
    where: { slug },
    select: { slug: true, title: true, content: true },
  });
}