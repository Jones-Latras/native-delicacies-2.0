export interface AboutValueItem {
  title: string;
  description: string;
}

export interface AboutPageContent {
  title: string;
  hero: {
    eyebrow: string;
    intro: string;
  };
  story: {
    eyebrow: string;
    mediaHeadline: string;
    mediaCaption: string;
    statValue: string;
    statLabel: string;
    title: string;
    paragraphs: string[];
  };
  details: {
    eyebrow: string;
    title: string;
    contentHtml: string;
  };
  values: {
    eyebrow: string;
    title: string;
    intro: string;
    items: AboutValueItem[];
  };
  cta: {
    title: string;
    text: string;
    label: string;
    href: string;
  };
}

const DEFAULT_ABOUT_PAGE_CONTENT: AboutPageContent = {
  title: "Rooted in Tradition, Shared With Heart",
  hero: {
    eyebrow: "Our Story",
    intro:
      "J&J Native Delicacies brings heirloom Filipino flavors to modern tables through handcrafted kakanin, celebration-ready bilao, and thoughtful pasalubong.",
  },
  story: {
    eyebrow: "Family Roots",
    mediaHeadline: "Kakanin",
    mediaCaption: "Heritage Recipe Collection",
    statValue: "15+",
    statLabel: "Years of Tradition",
    title: "A Family Kitchen Built for Celebrations",
    paragraphs: [
      "J&J Native Delicacies was shaped by the kind of recipes that usually live in handwritten notebooks, fiesta tables, and family kitchens. The business started with a simple goal: prepare Filipino delicacies that feel true to memory and generous enough for sharing.",
      "Over time, those family recipes became a dependable offering for customers looking for delicacies they could serve with pride, bring home as pasalubong, or order for birthdays, meetings, and milestone gatherings. Every tray and every box still carries that same spirit of hospitality.",
      "Today, we continue to honor the flavors people grew up with while presenting them in a way that feels ready for modern gifting and celebration. The intention stays the same - make tradition easy to bring to the table and meaningful to pass on.",
    ],
  },
  details: {
    eyebrow: "Behind the Brand",
    title: "How Our Delicacies Carry Tradition Forward",
    contentHtml: `
  <h2>How It Started</h2>
  <p>J&amp;J Native Delicacies began as a family kitchen built around recipes served at birthdays, town fiestas, Sunday merienda, and long-awaited reunions. What started as cooking for relatives and neighbors slowly grew into a trusted name for delicacies people wanted to bring home, share with guests, and send to loved ones.</p>
  <h2>What We Make</h2>
  <p>We focus on native Filipino delicacies that feel familiar, generous, and celebration-ready. From soft kakanin and baked favorites to curated bilao platters and pasalubong boxes, every item is prepared to highlight classic flavors, careful craftsmanship, and the warmth of traditional sharing.</p>
  <h2>Why It Matters</h2>
  <p>For us, these delicacies are more than products. They carry memory, region, ritual, and family. Each order is a way to keep Filipino food traditions visible and relevant, whether it is being served at a milestone event or enjoyed as a simple afternoon merienda.</p>
  <h2>How We Serve</h2>
  <p>We aim to make tradition easy to bring to the table. That means dependable quality, thoughtful presentation, and flexible options for gifting, gatherings, and custom bilao arrangements. We want every order to feel personal, polished, and worth sharing.</p>
`,
  },
  values: {
    eyebrow: "Guiding Principles",
    title: "What We Stand For",
    intro:
      "Our values shape how we prepare every order, work with ingredients, and show up for the people who trust us with their celebrations.",
    items: [
      {
        title: "Handcrafted Daily",
        description:
          "We prepare our delicacies with patience and consistency so every batch feels fresh, familiar, and celebration-ready.",
      },
      {
        title: "Honest Ingredients",
        description:
          "We choose ingredients that support rich, balanced flavor instead of shortcuts, so the classics taste the way they should.",
      },
      {
        title: "Heritage First",
        description:
          "We treat Filipino delicacies as living tradition, preserving the character and stories that make them worth sharing.",
      },
      {
        title: "Made for Sharing",
        description:
          "From small merienda orders to full bilao spreads, we design every order to feel warm, generous, and easy to bring to gatherings.",
      },
    ],
  },
  cta: {
    title: "Bring Heritage to the Table",
    text: "Explore the menu, build a bilao, or send a box of native delicacies made for gifting, merienda, and celebration.",
    label: "Explore Our Menu",
    href: "/menu",
  },
};

type AboutContentSource = {
  title?: string | null;
  content?: string | null;
};

function cloneValueItems(items: AboutValueItem[]): AboutValueItem[] {
  return items.map((item) => ({ ...item }));
}

export function getDefaultAboutPageContent(): AboutPageContent {
  return {
    title: DEFAULT_ABOUT_PAGE_CONTENT.title,
    hero: { ...DEFAULT_ABOUT_PAGE_CONTENT.hero },
    story: {
      ...DEFAULT_ABOUT_PAGE_CONTENT.story,
      paragraphs: [...DEFAULT_ABOUT_PAGE_CONTENT.story.paragraphs],
    },
    details: { ...DEFAULT_ABOUT_PAGE_CONTENT.details },
    values: {
      ...DEFAULT_ABOUT_PAGE_CONTENT.values,
      items: cloneValueItems(DEFAULT_ABOUT_PAGE_CONTENT.values.items),
    },
    cta: { ...DEFAULT_ABOUT_PAGE_CONTENT.cta },
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

function readValueItems(value: unknown, fallback: AboutValueItem[]): AboutValueItem[] {
  if (!Array.isArray(value)) {
    return cloneValueItems(fallback);
  }

  const items = value
    .filter(isRecord)
    .map((item) => ({
      title: readString(item.title, ""),
      description: readString(item.description, ""),
    }));

  return items.length > 0 ? items : cloneValueItems(fallback);
}

export function parseAboutPageContent(source?: AboutContentSource | null): AboutPageContent {
  const defaults = getDefaultAboutPageContent();
  const rawContent = typeof source?.content === "string" ? source.content.trim() : "";
  const titleFallback = readString(source?.title, defaults.title);

  if (!rawContent) {
    return {
      ...defaults,
      title: titleFallback,
    };
  }

  try {
    const parsed = JSON.parse(rawContent);

    if (!isRecord(parsed)) {
      throw new Error("Invalid About page payload");
    }

    const hero = isRecord(parsed.hero) ? parsed.hero : {};
    const story = isRecord(parsed.story) ? parsed.story : {};
    const details = isRecord(parsed.details) ? parsed.details : {};
    const values = isRecord(parsed.values) ? parsed.values : {};
    const cta = isRecord(parsed.cta) ? parsed.cta : {};

    return {
      title: readString(parsed.title, titleFallback),
      hero: {
        eyebrow: readString(hero.eyebrow, defaults.hero.eyebrow),
        intro: readString(hero.intro, defaults.hero.intro),
      },
      story: {
        eyebrow: readString(story.eyebrow, defaults.story.eyebrow),
        mediaHeadline: readString(story.mediaHeadline, defaults.story.mediaHeadline),
        mediaCaption: readString(story.mediaCaption, defaults.story.mediaCaption),
        statValue: readString(story.statValue, defaults.story.statValue),
        statLabel: readString(story.statLabel, defaults.story.statLabel),
        title: readString(story.title, defaults.story.title),
        paragraphs: readStringArray(story.paragraphs, defaults.story.paragraphs),
      },
      details: {
        eyebrow: readString(details.eyebrow, defaults.details.eyebrow),
        title: readString(details.title, defaults.details.title),
        contentHtml: readString(details.contentHtml, defaults.details.contentHtml),
      },
      values: {
        eyebrow: readString(values.eyebrow, defaults.values.eyebrow),
        title: readString(values.title, defaults.values.title),
        intro: readString(values.intro, defaults.values.intro),
        items: readValueItems(values.items, defaults.values.items),
      },
      cta: {
        title: readString(cta.title, defaults.cta.title),
        text: readString(cta.text, defaults.cta.text),
        label: readString(cta.label, defaults.cta.label),
        href: readString(cta.href, defaults.cta.href),
      },
    };
  } catch {
    return {
      ...defaults,
      title: titleFallback,
      details: {
        ...defaults.details,
        contentHtml: rawContent,
      },
    };
  }
}

export function serializeAboutPageContent(content: AboutPageContent): string {
  return JSON.stringify(content, null, 2);
}
