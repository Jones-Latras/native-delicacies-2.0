import { PolicyPageContent } from "@/components/storefront/policy-page-content";
import { getPolicyPageContent } from "@/lib/policy-content";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const content = await getPolicyPageContent("privacy");

  return <PolicyPageContent content={content} />;
}
