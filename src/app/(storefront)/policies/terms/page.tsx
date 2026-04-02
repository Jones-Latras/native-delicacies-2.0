import { PolicyPageContent } from "@/components/storefront/policy-page-content";
import { getPolicyPageContent } from "@/lib/policy-content.server";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const content = await getPolicyPageContent("terms");

  return <PolicyPageContent content={content} />;
}
