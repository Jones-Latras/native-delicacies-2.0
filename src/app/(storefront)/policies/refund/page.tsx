import { PolicyPageContent } from "@/components/storefront/policy-page-content";
import { getPolicyPageContent } from "@/lib/policy-content";

export const dynamic = "force-dynamic";

export default async function RefundPolicyPage() {
  const content = await getPolicyPageContent("refund");

  return <PolicyPageContent content={content} />;
}
