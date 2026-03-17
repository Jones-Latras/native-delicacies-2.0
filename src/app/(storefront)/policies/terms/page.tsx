import { getPolicyContentPage } from "@/lib/policy-content";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const page = await getPolicyContentPage("terms");

  if (page) {
    return (
      <div>
        <h1>{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    );
  }

  return (
    <div>
      <h1>Terms & Conditions</h1>
      <p><em>Last updated: March 2025</em></p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using the J&J Native Delicacies website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
      </p>

      <h2>2. Services</h2>
      <p>
        J&J Native Delicacies provides an online platform for ordering J&J Native Delicacies for delivery or pickup. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
      </p>

      <h2>3. Account Registration</h2>
      <ul>
        <li>You must provide accurate and complete information when creating an account</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials</li>
        <li>You must be at least 16 years old to create an account</li>
        <li>One account per person; duplicate accounts may be suspended</li>
      </ul>

      <h2>4. Orders & Payments</h2>
      <ul>
        <li>All prices are displayed in Philippine Pesos (₱) and include applicable taxes unless stated otherwise</li>
        <li>We reserve the right to refuse or cancel any order at our discretion</li>
        <li>Prices and availability are subject to change without notice</li>
        <li>Payment must be completed in full before or upon delivery</li>
        <li>We accept credit/debit cards and cash payments</li>
      </ul>

      <h2>5. Delivery</h2>
      <ul>
        <li>Delivery times are estimates and may vary depending on order volume and distance</li>
        <li>We are not liable for delays caused by circumstances beyond our control</li>
        <li>The customer must be available at the delivery address to receive the order</li>
        <li>Additional delivery attempts may incur extra charges</li>
      </ul>

      <h2>6. Product Information</h2>
      <ul>
        <li>We strive to provide accurate product descriptions and images</li>
        <li>Due to the handcrafted nature of our products, slight variations in appearance are normal</li>
        <li>Allergen information is provided as guidance; please contact us for specific dietary concerns</li>
        <li>Shelf life information is provided for optimal freshness; consume within the recommended period</li>
      </ul>

      <h2>7. Promotional Offers</h2>
      <ul>
        <li>Promotional codes are valid for the specified period and conditions only</li>
        <li>Promotions cannot be combined unless explicitly stated</li>
        <li>We reserve the right to cancel or modify promotions at any time</li>
      </ul>

      <h2>8. Intellectual Property</h2>
      <p>
        All content on this website, including text, images, logos, and designs, is the property of J&J Native Delicacies and is protected by intellectual property laws. You may not reproduce, distribute, or use our content without written permission.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, J&J Native Delicacies shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our maximum liability for any claim shall not exceed the amount you paid for the order in question.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of the courts in Quezon City.
      </p>

      <h2>11. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the updated Terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        For questions about these Terms, please contact us at <strong>hello@jjnativedelicacies.ph</strong> or <strong>+63 917 123 4567</strong>.
      </p>
    </div>
  );
}

