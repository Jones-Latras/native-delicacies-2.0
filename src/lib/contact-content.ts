export interface ContactPageContent {
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  details: {
    eyebrow: string;
    title: string;
    intro: string;
    visitTitle: string;
    visitText: string;
    fallbackAddressLines: string[];
    callTitle: string;
    callText: string;
    fallbackPhone: string;
    emailTitle: string;
    emailText: string;
    fallbackEmail: string;
    hoursTitle: string;
    hoursText: string;
    fallbackHoursLines: string[];
    followTitle: string;
    followText: string;
    facebookUrl: string;
    instagramUrl: string;
  };
  form: {
    eyebrow: string;
    title: string;
    intro: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phoneOptionalText: string;
    phonePlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
    successTitle: string;
    successText: string;
    sendAnotherLabel: string;
  };
  map: {
    eyebrow: string;
    title: string;
    intro: string;
    placeholderText: string;
  };
}

type ContactContentSource = {
  title?: string | null;
  content?: string | null;
};

const DEFAULT_CONTACT_PAGE_CONTENT: ContactPageContent = {
  hero: {
    eyebrow: "Get In Touch",
    title: "Contact Us",
    intro:
      "Have a question, a custom bilao request, or a catering inquiry? Reach out and our team will help you plan the right order for your table.",
  },
  details: {
    eyebrow: "Reach Our Team",
    title: "Ways To Connect",
    intro:
      "Use the contact details below for store visits, same-day order questions, custom requests, and partnership inquiries.",
    visitTitle: "Visit Us",
    visitText: "Drop by for pickups, product inquiries, or coordination for larger celebration orders.",
    fallbackAddressLines: ["123 Heritage Street, Barangay San Jose", "Quezon City, Metro Manila 1100"],
    callTitle: "Call Us",
    callText: "Best for urgent updates, same-day order checks, and delivery coordination.",
    fallbackPhone: "+63 917 123 4567",
    emailTitle: "Email Us",
    emailText: "Ideal for catering questions, brand collaborations, and event planning inquiries.",
    fallbackEmail: "hello@jjnativedelicacies.ph",
    hoursTitle: "Business Hours",
    hoursText: "Our response times follow our shop and kitchen hours. Messages sent after hours are answered on the next business day.",
    fallbackHoursLines: [
      "Monday to Friday: 8:00 AM - 8:00 PM",
      "Saturday: 9:00 AM - 9:00 PM",
      "Sunday: 9:00 AM - 6:00 PM",
    ],
    followTitle: "Follow Us",
    followText: "See new delicacies, seasonal specials, and celebration-ready bilao ideas on our social channels.",
    facebookUrl: "https://www.facebook.com/jjnativedelicacies",
    instagramUrl: "https://www.instagram.com/jjnativedelicacies",
  },
  form: {
    eyebrow: "Send A Message",
    title: "Tell Us What You Need",
    intro:
      "Share your event date, preferred products, quantity, and special requests so we can recommend the best setup for your order.",
    nameLabel: "Name *",
    namePlaceholder: "Your name",
    emailLabel: "Email *",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Phone",
    phoneOptionalText: "(optional)",
    phonePlaceholder: "+63 917 123 4567",
    subjectLabel: "Subject *",
    subjectPlaceholder: "What is this about?",
    messageLabel: "Message *",
    messagePlaceholder: "Tell us how we can help...",
    submitLabel: "Send Message",
    submittingLabel: "Sending...",
    successTitle: "Message Sent!",
    successText: "Thank you for reaching out. Our team will get back to you within 24 hours.",
    sendAnotherLabel: "Send another message",
  },
  map: {
    eyebrow: "Find The Store",
    title: "Location",
    intro: "Use the map below to plan pickups, coordinate rider instructions, or confirm travel time before your visit.",
    placeholderText: "Google Maps embed - configure this section with your live map link or embed.",
  },
};

function cloneStringArray(items: string[]): string[] {
  return [...items];
}

export function getDefaultContactPageContent(): ContactPageContent {
  return {
    hero: { ...DEFAULT_CONTACT_PAGE_CONTENT.hero },
    details: {
      ...DEFAULT_CONTACT_PAGE_CONTENT.details,
      fallbackAddressLines: cloneStringArray(DEFAULT_CONTACT_PAGE_CONTENT.details.fallbackAddressLines),
      fallbackHoursLines: cloneStringArray(DEFAULT_CONTACT_PAGE_CONTENT.details.fallbackHoursLines),
    },
    form: { ...DEFAULT_CONTACT_PAGE_CONTENT.form },
    map: { ...DEFAULT_CONTACT_PAGE_CONTENT.map },
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
    return cloneStringArray(fallback);
  }

  return cloneStringArray(value);
}

export function parseContactPageContent(source?: ContactContentSource | null): ContactPageContent {
  const defaults = getDefaultContactPageContent();
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
      throw new Error("Invalid contact page payload");
    }

    const hero = isRecord(parsed.hero) ? parsed.hero : {};
    const details = isRecord(parsed.details) ? parsed.details : {};
    const form = isRecord(parsed.form) ? parsed.form : {};
    const map = isRecord(parsed.map) ? parsed.map : {};

    return {
      hero: {
        eyebrow: readString(hero.eyebrow, defaults.hero.eyebrow),
        title: readString(hero.title, titleFallback),
        intro: readString(hero.intro, defaults.hero.intro),
      },
      details: {
        eyebrow: readString(details.eyebrow, defaults.details.eyebrow),
        title: readString(details.title, defaults.details.title),
        intro: readString(details.intro, defaults.details.intro),
        visitTitle: readString(details.visitTitle, defaults.details.visitTitle),
        visitText: readString(details.visitText, defaults.details.visitText),
        fallbackAddressLines: readStringArray(details.fallbackAddressLines, defaults.details.fallbackAddressLines),
        callTitle: readString(details.callTitle, defaults.details.callTitle),
        callText: readString(details.callText, defaults.details.callText),
        fallbackPhone: readString(details.fallbackPhone, defaults.details.fallbackPhone),
        emailTitle: readString(details.emailTitle, defaults.details.emailTitle),
        emailText: readString(details.emailText, defaults.details.emailText),
        fallbackEmail: readString(details.fallbackEmail, defaults.details.fallbackEmail),
        hoursTitle: readString(details.hoursTitle, defaults.details.hoursTitle),
        hoursText: readString(details.hoursText, defaults.details.hoursText),
        fallbackHoursLines: readStringArray(details.fallbackHoursLines, defaults.details.fallbackHoursLines),
        followTitle: readString(details.followTitle, defaults.details.followTitle),
        followText: readString(details.followText, defaults.details.followText),
        facebookUrl: readString(details.facebookUrl, defaults.details.facebookUrl),
        instagramUrl: readString(details.instagramUrl, defaults.details.instagramUrl),
      },
      form: {
        eyebrow: readString(form.eyebrow, defaults.form.eyebrow),
        title: readString(form.title, defaults.form.title),
        intro: readString(form.intro, defaults.form.intro),
        nameLabel: readString(form.nameLabel, defaults.form.nameLabel),
        namePlaceholder: readString(form.namePlaceholder, defaults.form.namePlaceholder),
        emailLabel: readString(form.emailLabel, defaults.form.emailLabel),
        emailPlaceholder: readString(form.emailPlaceholder, defaults.form.emailPlaceholder),
        phoneLabel: readString(form.phoneLabel, defaults.form.phoneLabel),
        phoneOptionalText: readString(form.phoneOptionalText, defaults.form.phoneOptionalText),
        phonePlaceholder: readString(form.phonePlaceholder, defaults.form.phonePlaceholder),
        subjectLabel: readString(form.subjectLabel, defaults.form.subjectLabel),
        subjectPlaceholder: readString(form.subjectPlaceholder, defaults.form.subjectPlaceholder),
        messageLabel: readString(form.messageLabel, defaults.form.messageLabel),
        messagePlaceholder: readString(form.messagePlaceholder, defaults.form.messagePlaceholder),
        submitLabel: readString(form.submitLabel, defaults.form.submitLabel),
        submittingLabel: readString(form.submittingLabel, defaults.form.submittingLabel),
        successTitle: readString(form.successTitle, defaults.form.successTitle),
        successText: readString(form.successText, defaults.form.successText),
        sendAnotherLabel: readString(form.sendAnotherLabel, defaults.form.sendAnotherLabel),
      },
      map: {
        eyebrow: readString(map.eyebrow, defaults.map.eyebrow),
        title: readString(map.title, defaults.map.title),
        intro: readString(map.intro, defaults.map.intro),
        placeholderText: readString(map.placeholderText, defaults.map.placeholderText),
      },
    };
  } catch {
    return {
      ...defaults,
      hero: { ...defaults.hero, title: titleFallback },
    };
  }
}

export function serializeContactPageContent(content: ContactPageContent): string {
  return JSON.stringify(content, null, 2);
}
