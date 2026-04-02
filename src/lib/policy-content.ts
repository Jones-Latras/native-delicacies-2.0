export const POLICY_SLUGS = ["delivery", "refund", "privacy", "terms"] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];

export interface PolicySectionContent {
  key: string;
  adminLabel: string;
  title: string;
  description: string;
  items: string[];
}

export interface PolicyPageContent {
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
    updatedLabel: string;
    updatedDate: string;
  };
  sections: PolicySectionContent[];
}

type PolicyContentSource = {
  title?: string | null;
  content?: string | null;
};

export const POLICY_FALLBACK_TITLES: Record<PolicySlug, string> = {
  delivery: "Delivery Areas & Fees",
  refund: "Refund & Cancellation Policy",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
};

const DEFAULT_POLICY_PAGE_CONTENT: Record<PolicySlug, PolicyPageContent> = {
  delivery: {
    hero: {
      eyebrow: "Delivery Guide",
      title: "Delivery Areas & Fees",
      intro:
        "We coordinate delivery based on freshness, distance, and rider availability so your delicacies arrive on time and in excellent condition.",
      updatedLabel: "Last updated",
      updatedDate: "April 2, 2026",
    },
    sections: [
      {
        key: "coverage",
        adminLabel: "Coverage",
        title: "Delivery Coverage",
        description:
          "We currently serve Metro Manila and nearby areas that can be reached while preserving the quality and presentation of each order.",
        items: [
          "Quezon City",
          "Manila",
          "Makati",
          "Pasig",
          "Mandaluyong",
          "San Juan",
          "Marikina",
          "Taguig",
          "Pasay",
          "Paranaque",
        ],
      },
      {
        key: "fees",
        adminLabel: "Fees",
        title: "Delivery Fees",
        description:
          "Fees are based on distance, route complexity, and order handling requirements for trays, bilao, and boxed delicacies.",
        items: [
          "Within 5 km - PHP 50",
          "More than 5 km up to 10 km - PHP 80",
          "More than 10 km up to 15 km - PHP 120",
          "Beyond 15 km - PHP 150 and up, subject to rider availability",
          "Free delivery is available for qualifying orders that meet the current minimum spend threshold",
        ],
      },
      {
        key: "lead-times",
        adminLabel: "Lead Times",
        title: "Estimated Delivery Times",
        description:
          "Turnaround varies based on order size, preparation time, weather, and peak meal-hour traffic conditions.",
        items: [
          "Regular menu orders: 45 to 90 minutes after confirmation",
          "Bilao and larger celebration orders: schedule at least 24 hours ahead when possible",
          "Peak windows such as lunch, late afternoon, and holidays may require additional lead time",
          "Scheduled orders are prioritized around the requested handoff time",
        ],
      },
      {
        key: "minimum-order",
        adminLabel: "Minimum Order",
        title: "Minimum Order and Free Delivery",
        description:
          "A minimum basket amount may apply to delivery orders so we can maintain efficient routing and order quality.",
        items: [
          "Delivery orders may require a minimum order value",
          "Pickup orders remain available even when a delivery minimum is not met",
          "Free delivery promotions apply only to covered areas and qualifying order totals",
        ],
      },
      {
        key: "pickup",
        adminLabel: "Pickup",
        title: "Store Pickup Option",
        description:
          "Customers may choose pickup for faster handoff, lower cost, or more precise celebration timing.",
        items: [
          "Pickup is recommended for rush orders, large bilao arrangements, and self-booked courier handoff",
          "Please arrive within the confirmed pickup window to keep products at their best quality",
        ],
      },
      {
        key: "reminders",
        adminLabel: "Reminders",
        title: "Important Delivery Reminders",
        description:
          "A few simple checks help us avoid delays and make handoff smoother for both customers and riders.",
        items: [
          "Provide an accurate landmark, complete address, and reachable mobile number",
          "Ensure someone is available to receive the order at the agreed time",
          "Delays caused by severe weather, building access controls, or unreachable recipients may affect final timing",
        ],
      },
    ],
  },
  refund: {
    hero: {
      eyebrow: "Customer Care",
      title: "Refund & Cancellation Policy",
      intro:
        "Because many orders are freshly prepared to schedule, cancellation and refund decisions depend on how far production and delivery have already progressed.",
      updatedLabel: "Last updated",
      updatedDate: "April 2, 2026",
    },
    sections: [
      {
        key: "cancellations-before-prep",
        adminLabel: "Cancellation Window",
        title: "Orders That Can Still Be Cancelled",
        description:
          "We can usually accommodate cancellations before production begins or while payment confirmation is still being processed.",
        items: [
          "Orders not yet confirmed by our team may be cancelled without charge",
          "Confirmed orders may still be cancelled if kitchen preparation has not started",
          "Card payments may be subject to processor deductions or reversal timing",
        ],
      },
      {
        key: "in-production",
        adminLabel: "In Production",
        title: "Orders Already in Preparation",
        description:
          "Once ingredients have been allocated or production has begun, cancellation options become limited because the order has already moved into fulfillment.",
        items: [
          "Custom bilao orders, made-to-order items, and same-day rush trays may become non-cancellable sooner",
          "Fully or partially prepared orders may only qualify for store credit or partial refund review",
        ],
      },
      {
        key: "eligible-refunds",
        adminLabel: "Eligible Refunds",
        title: "Situations Eligible for Review",
        description:
          "We review refund or replacement requests when the delivered order does not match what was confirmed.",
        items: [
          "Wrong items delivered",
          "Missing items from the confirmed order",
          "Products arriving in poor condition due to handling or transport issues",
          "Orders delayed far beyond the committed delivery window without prior notice",
        ],
      },
      {
        key: "reporting",
        adminLabel: "How To Report",
        title: "How To Report an Issue",
        description:
          "The fastest way to help us investigate is to contact us as soon as possible with the order number and clear supporting details.",
        items: [
          "Contact us within 24 hours of receipt",
          "Share the order number, issue summary, and best callback channel",
          "Include photos for damaged packaging, missing components, or incorrect items whenever possible",
        ],
      },
      {
        key: "refund-method",
        adminLabel: "Refund Method",
        title: "How Refunds Are Issued",
        description:
          "Approved refunds are returned using the original method where possible, or through a replacement or store credit arrangement agreed with the customer.",
        items: [
          "Card payments are refunded back to the original payment method, subject to banking timelines",
          "Cash payments may be resolved through replacement, store credit, or bank transfer",
          "Refund timing depends on payment partner processing and internal review completion",
        ],
      },
      {
        key: "quality-guarantee",
        adminLabel: "Quality Guarantee",
        title: "Replacement or Store Credit",
        description:
          "In some cases, a replacement order or store credit is the best solution, especially for celebration orders where timing matters more than a delayed reversal.",
        items: [
          "We may offer a replacement for incorrect or compromised items",
          "Store credit may be issued for future orders when both parties agree it is the most practical resolution",
        ],
      },
      {
        key: "support-contact",
        adminLabel: "Support Contact",
        title: "Refund and Cancellation Support",
        description:
          "For urgent order concerns, please contact the shop directly using the published business phone or email channels.",
        items: [
          "Phone support is best for same-day order concerns",
          "Email support is best for follow-up documentation and payment review questions",
        ],
      },
    ],
  },
  privacy: {
    hero: {
      eyebrow: "Data Privacy",
      title: "Privacy Policy",
      intro:
        "We collect only the information needed to manage orders, communicate with customers, improve service, and protect the integrity of the platform.",
      updatedLabel: "Last updated",
      updatedDate: "April 2, 2026",
    },
    sections: [
      {
        key: "information-collected",
        adminLabel: "Information Collected",
        title: "Information We Collect",
        description:
          "The types of information we collect depend on how you use the website, whether you create an account, and whether you place an order.",
        items: [
          "Account information such as name, email address, phone number, and password credentials",
          "Order information such as delivery address, pickup preferences, special instructions, and payment-related metadata",
          "Messages sent through the contact form, support channels, or order coordination channels",
          "Basic device and browsing information used to improve performance, security, and usability",
        ],
      },
      {
        key: "how-we-use",
        adminLabel: "How We Use Data",
        title: "How We Use Your Information",
        description:
          "Customer information is used only for operational, service, and legal purposes connected to running the business responsibly.",
        items: [
          "To confirm, prepare, deliver, and support your orders",
          "To send order updates, payment confirmations, and pickup or delivery coordination messages",
          "To improve the website, menu presentation, and customer experience",
          "To respond to inquiries, feedback, and customer support concerns",
          "To detect fraud, abuse, or misuse of the platform",
        ],
      },
      {
        key: "sharing",
        adminLabel: "Information Sharing",
        title: "When We Share Information",
        description:
          "We do not sell customer data. Information is shared only when necessary to complete services or comply with legal obligations.",
        items: [
          "Payment processors handling checkout and verification",
          "Delivery or logistics partners fulfilling customer orders",
          "Service providers supporting email, hosting, analytics, or communications",
          "Government or legal authorities when required by law or lawful process",
        ],
      },
      {
        key: "cookies",
        adminLabel: "Cookies",
        title: "Cookies and Website Preferences",
        description:
          "Cookies and similar technologies help the website remember essential session and preference information.",
        items: [
          "Essential cookies may be used to maintain login sessions and shopping cart state",
          "Preference cookies may be used to remember user choices that improve repeat visits",
          "We avoid unnecessary tracking tools unless clearly disclosed and justified",
        ],
      },
      {
        key: "security-retention",
        adminLabel: "Security and Retention",
        title: "Security and Data Retention",
        description:
          "We apply reasonable technical and operational safeguards and retain information only as long as needed for service, compliance, and dispute handling.",
        items: [
          "Use of secure transmission methods and protected service integrations",
          "Restricted internal access to customer information",
          "Retention periods based on operational need, legal obligations, and dispute resolution requirements",
        ],
      },
      {
        key: "rights",
        adminLabel: "Your Rights",
        title: "Your Privacy Choices",
        description:
          "Customers may contact us to request updates or clarification regarding the personal data associated with their account or order history.",
        items: [
          "Request access to the personal information we hold about you",
          "Request correction of inaccurate or outdated information",
          "Request account closure or deletion where legally permitted",
          "Opt out of optional marketing communications",
        ],
      },
      {
        key: "children",
        adminLabel: "Children's Privacy",
        title: "Children's Privacy",
        description:
          "Our services are intended for general audiences and are not knowingly directed to children who cannot legally consent to data collection under applicable rules.",
        items: [
          "We do not knowingly collect personal information from children without appropriate consent",
        ],
      },
      {
        key: "updates-contact",
        adminLabel: "Updates and Contact",
        title: "Policy Updates and Contact",
        description:
          "We may revise this policy as our operations, service providers, or legal obligations change. Updated versions will be posted on this page.",
        items: [
          "Please review this page periodically for the latest version",
          "For privacy-related questions, use the business contact details listed on the Contact page",
        ],
      },
    ],
  },
  terms: {
    hero: {
      eyebrow: "Shop Terms",
      title: "Terms & Conditions",
      intro:
        "These terms govern the use of our website, account features, ordering tools, and related services provided by J&J Native Delicacies.",
      updatedLabel: "Last updated",
      updatedDate: "April 2, 2026",
    },
    sections: [
      {
        key: "use-of-site",
        adminLabel: "Use of Site",
        title: "Use of the Website",
        description:
          "By accessing the website, you agree to use it lawfully and only for browsing, purchasing, and communicating with the business in good faith.",
        items: [
          "Do not misuse forms, checkout flows, or account tools",
          "Do not attempt unauthorized access to protected areas or other customer data",
        ],
      },
      {
        key: "orders-pricing",
        adminLabel: "Orders and Pricing",
        title: "Orders, Pricing, and Availability",
        description:
          "All orders are subject to acceptance, stock availability, production capacity, and operational review.",
        items: [
          "Prices may change without prior notice",
          "Menu availability can vary based on ingredients, seasonality, and order volume",
          "The business may decline or cancel orders that cannot be fulfilled properly",
        ],
      },
      {
        key: "accounts",
        adminLabel: "Accounts",
        title: "Account Responsibilities",
        description:
          "If you create an account, you are responsible for keeping your login details secure and for ensuring the information provided is accurate.",
        items: [
          "Provide current and truthful account details",
          "Protect your password and account access",
          "Notify us if you suspect unauthorized account use",
        ],
      },
      {
        key: "payments",
        adminLabel: "Payments",
        title: "Payment Terms",
        description:
          "Payment requirements depend on the order type, selected payment method, and any applicable promotions or balance adjustments.",
        items: [
          "Orders may require full payment before production or dispatch",
          "Failed or incomplete payment may delay confirmation",
          "Promotions and discount codes are subject to their own terms and validation rules",
        ],
      },
      {
        key: "delivery-pickup",
        adminLabel: "Delivery and Pickup",
        title: "Delivery and Pickup",
        description:
          "Estimated handoff times are targets, not guarantees, especially during holidays, adverse weather, and high-volume periods.",
        items: [
          "Customers must provide accurate recipient and location information",
          "Pickup orders should be claimed within the confirmed time window",
          "Delivery fees and conditions are governed by the current delivery policy",
        ],
      },
      {
        key: "product-information",
        adminLabel: "Product Information",
        title: "Product Information and Handling",
        description:
          "We aim to describe products clearly, but handcrafted delicacies may vary slightly in appearance, packaging, or garnish from reference photos.",
        items: [
          "Check allergen and storage guidance before serving",
          "Follow shelf-life and handling recommendations to preserve product quality",
          "Customizations may affect preparation time and final presentation",
        ],
      },
      {
        key: "promotions",
        adminLabel: "Promotions",
        title: "Promotions and Discount Codes",
        description:
          "Promotional offers are limited by validity period, qualifying conditions, and operational availability.",
        items: [
          "Promotions may not be combined unless explicitly stated",
          "Misuse of promo codes may result in cancellation or account review",
        ],
      },
      {
        key: "intellectual-property",
        adminLabel: "Intellectual Property",
        title: "Intellectual Property",
        description:
          "Brand assets, website copy, menu presentation, photographs, and design elements remain the property of J&J Native Delicacies unless otherwise stated.",
        items: [
          "Do not reproduce or republish our content without permission",
        ],
      },
      {
        key: "acceptable-use",
        adminLabel: "Acceptable Use",
        title: "Acceptable Use",
        description:
          "Users must not submit abusive, fraudulent, harmful, or misleading content through the website or contact channels.",
        items: [
          "No impersonation, harassment, spam, or malicious activity",
          "No use of the platform for unlawful or deceptive conduct",
        ],
      },
      {
        key: "liability",
        adminLabel: "Liability",
        title: "Limitation of Liability",
        description:
          "To the extent permitted by law, liability is limited to the value of the affected order and does not extend to indirect or consequential damages arising from service use.",
        items: [
          "Service interruptions, third-party delays, and force majeure events may affect outcomes outside our direct control",
        ],
      },
      {
        key: "updates-law",
        adminLabel: "Updates and Governing Law",
        title: "Changes to Terms and Governing Law",
        description:
          "We may revise these terms from time to time. Continued use of the website after updates constitutes acceptance of the revised version.",
        items: [
          "Applicable disputes are governed by the laws of the Republic of the Philippines",
          "Questions about these terms may be directed to the business through official contact channels",
        ],
      },
    ],
  },
};

function cloneSection(section: PolicySectionContent): PolicySectionContent {
  return {
    ...section,
    items: [...section.items],
  };
}

export function getDefaultPolicyPageContent(slug: PolicySlug): PolicyPageContent {
  const content = DEFAULT_POLICY_PAGE_CONTENT[slug];

  return {
    hero: { ...content.hero },
    sections: content.sections.map(cloneSection),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return [...fallback];
  }

  return [...value];
}

function readSections(value: unknown, fallback: PolicySectionContent[]): PolicySectionContent[] {
  if (!Array.isArray(value)) {
    return fallback.map(cloneSection);
  }

  const sections = value
    .filter(isRecord)
    .map((section, index) => {
      const defaultSection = fallback[index] ?? fallback[fallback.length - 1];

      return {
        key: readString(section.key, defaultSection?.key ?? `section-${index + 1}`),
        adminLabel: readString(section.adminLabel, defaultSection?.adminLabel ?? `Section ${index + 1}`),
        title: readString(section.title, defaultSection?.title ?? ""),
        description: readString(section.description, defaultSection?.description ?? ""),
        items: readStringArray(section.items, defaultSection?.items ?? []),
      };
    });

  return sections.length > 0 ? sections : fallback.map(cloneSection);
}

export function parsePolicyPageContent(slug: PolicySlug, source?: PolicyContentSource | null): PolicyPageContent {
  const defaults = getDefaultPolicyPageContent(slug);
  const rawContent = typeof source?.content === "string" ? source.content.trim() : "";
  const titleFallback = readString(source?.title, defaults.hero.title);

  if (!rawContent) {
    return {
      ...defaults,
      hero: { ...defaults.hero, title: titleFallback },
    };
  }

  try {
    const parsed = JSON.parse(rawContent);

    if (!isRecord(parsed)) {
      throw new Error("Invalid policy page payload");
    }

    const hero = isRecord(parsed.hero) ? parsed.hero : {};

    return {
      hero: {
        eyebrow: readString(hero.eyebrow, defaults.hero.eyebrow),
        title: readString(hero.title, titleFallback),
        intro: readString(hero.intro, defaults.hero.intro),
        updatedLabel: readString(hero.updatedLabel, defaults.hero.updatedLabel),
        updatedDate: readString(hero.updatedDate, defaults.hero.updatedDate),
      },
      sections: readSections(parsed.sections, defaults.sections),
    };
  } catch {
    return {
      ...defaults,
      hero: { ...defaults.hero, title: titleFallback },
    };
  }
}

export function serializePolicyPageContent(content: PolicyPageContent): string {
  return JSON.stringify(content, null, 2);
}
