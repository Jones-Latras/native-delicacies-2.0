import { PolicyPageContent } from "@/components/storefront/policy-page-content";
import { getPolicyPageContent } from "@/lib/policy-content";

export const dynamic = "force-dynamic";

export default async function DeliveryPolicyPage() {
  const content = await getPolicyPageContent("delivery");

  return <PolicyPageContent content={content} />;
}
