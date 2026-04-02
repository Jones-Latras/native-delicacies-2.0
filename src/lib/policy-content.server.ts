import { prisma } from "@/lib/prisma";
import {
  POLICY_FALLBACK_TITLES,
  POLICY_SLUGS,
  parsePolicyPageContent,
  type PolicyPageContent,
  type PolicySlug,
} from "@/lib/policy-content";

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

export async function getPolicyPageContent(slug: PolicySlug): Promise<PolicyPageContent> {
  const page = await prisma.contentPage.findUnique({
    where: { slug },
    select: { title: true, content: true },
  });

  return parsePolicyPageContent(slug, page);
}
