"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Megaphone, Plus, Save } from "lucide-react";
import {
  getDefaultAboutPageContent,
  parseAboutPageContent,
  serializeAboutPageContent,
  type AboutPageContent,
} from "@/lib/about-content";
import {
  getDefaultContactPageContent,
  parseContactPageContent,
  serializeContactPageContent,
  type ContactPageContent,
} from "@/lib/contact-content";
import {
  POLICY_FALLBACK_TITLES,
  POLICY_SLUGS,
  getDefaultPolicyPageContent,
  parsePolicyPageContent,
  serializePolicyPageContent,
  type PolicyPageContent,
  type PolicySlug,
} from "@/lib/policy-content";

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface AnnouncementSettings {
  announcementText: string | null;
  announcementActive: boolean;
  announcementBgColor: string;
}

const DEFAULT_PAGES = [
  { slug: "about", title: "About Us" },
  { slug: "contact", title: "Contact Us" },
  { slug: "delivery", title: "Delivery Areas & Fees" },
  { slug: "refund", title: "Refund & Cancellation Policy" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
] as const;

const POLICY_SLUG_SET = new Set<string>(POLICY_SLUGS);
const inputClass =
  "w-full border border-slate-200 bg-transparent px-4 py-2.5 text-sm focus:border-primary focus:outline-none";
const textareaClass =
  "w-full border border-slate-200 bg-transparent px-4 py-3 text-sm focus:border-primary focus:outline-none";

function isPolicySlug(value: string): value is PolicySlug {
  return POLICY_SLUG_SET.has(value);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder={placeholder} />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  mono = false,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`${textareaClass}${mono ? " font-mono" : ""}`}
        placeholder={placeholder}
      />
    </div>
  );
}

function Category({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function AdminContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [aboutPage, setAboutPage] = useState<AboutPageContent>(() => getDefaultAboutPageContent());
  const [contactPage, setContactPage] = useState<ContactPageContent>(() => getDefaultContactPageContent());
  const [policyPage, setPolicyPage] = useState<PolicyPageContent>(() => getDefaultPolicyPageContent("delivery"));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementSettings>({
    announcementText: "",
    announcementActive: false,
    announcementBgColor: "#8b4513",
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  const fetchPages = useCallback(async () => {
    const res = await fetch("/api/admin/content");
    if (res.ok) {
      const json = await res.json();
      setPages(json.data);
    }
  }, []);

  const fetchAnnouncement = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const json = await res.json();
      setAnnouncement({
        announcementText: json.data.announcementText || "",
        announcementActive: json.data.announcementActive || false,
        announcementBgColor: json.data.announcementBgColor || "#8b4513",
      });
    }
  }, []);

  useEffect(() => {
    fetchPages();
    fetchAnnouncement();
  }, [fetchAnnouncement, fetchPages]);

  function selectPage(slug: string) {
    setSelected(slug);

    const page = pages.find((entry) => entry.slug === slug);
    const defaultTitle = DEFAULT_PAGES.find((entry) => entry.slug === slug)?.title ?? slug;

    if (slug === "about") {
      setAboutPage(parseAboutPageContent(page ?? { title: defaultTitle, content: "" }));
    } else if (slug === "contact") {
      setContactPage(parseContactPageContent(page ?? { title: defaultTitle, content: "" }));
    } else if (isPolicySlug(slug)) {
      setPolicyPage(parsePolicyPageContent(slug, page ?? { title: defaultTitle, content: "" }));
    }

    setMsg(null);
  }

  async function savePage() {
    if (!selected) return;

    setSaving(true);
    setMsg(null);

    const payload =
      selected === "about"
        ? {
            slug: selected,
            title: aboutPage.title,
            content: serializeAboutPageContent(aboutPage),
          }
        : selected === "contact"
          ? {
              slug: selected,
              title: contactPage.hero.title,
              content: serializeContactPageContent(contactPage),
            }
          : isPolicySlug(selected)
            ? {
                slug: selected,
                title: policyPage.hero.title,
                content: serializePolicyPageContent(policyPage),
              }
            : null;

    if (!payload) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMsg("Saved successfully.");
        await fetchPages();
      } else {
        const json = await res.json();
        setMsg(`Error: ${json.error}`);
      }
    } catch {
      setMsg("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveAnnouncement() {
    setSavingAnnouncement(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcement),
      });
      setMsg("Announcement saved.");
    } catch {
      setMsg("Failed to save announcement");
    } finally {
      setSavingAnnouncement(false);
    }
  }

  function renderAboutEditor() {
    return (
      <div className="space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">About Page</h2>
          <p className="mt-1 text-sm text-slate-500">
            Edit the About page by section so headers, subheaders, and supporting copy stay organized.
          </p>
        </div>

        <Category title="Hero" description="Top eyebrow, headline, and intro copy.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Heading" value={aboutPage.title} onChange={(value) => setAboutPage((prev) => ({ ...prev, title: value }))} />
            </div>
            <div className="md:col-span-2">
              <Field
                label="Eyebrow"
                value={aboutPage.hero.eyebrow}
                onChange={(value) => setAboutPage((prev) => ({ ...prev, hero: { ...prev.hero, eyebrow: value } }))}
              />
            </div>
            <div className="md:col-span-2">
              <TextAreaField
                label="Intro"
                value={aboutPage.hero.intro}
                onChange={(value) => setAboutPage((prev) => ({ ...prev, hero: { ...prev.hero, intro: value } }))}
              />
            </div>
          </div>
        </Category>

        <Category title="Story" description="Main About section, story paragraphs, and visual callouts.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field
                label="Section Eyebrow"
                value={aboutPage.story.eyebrow}
                onChange={(value) => setAboutPage((prev) => ({ ...prev, story: { ...prev.story, eyebrow: value } }))}
              />
            </div>
            <div className="md:col-span-2">
              <Field
                label="Section Heading"
                value={aboutPage.story.title}
                onChange={(value) => setAboutPage((prev) => ({ ...prev, story: { ...prev.story, title: value } }))}
              />
            </div>
            <Field
              label="Visual Headline"
              value={aboutPage.story.mediaHeadline}
              onChange={(value) => setAboutPage((prev) => ({ ...prev, story: { ...prev.story, mediaHeadline: value } }))}
            />
            <Field
              label="Visual Caption"
              value={aboutPage.story.mediaCaption}
              onChange={(value) => setAboutPage((prev) => ({ ...prev, story: { ...prev.story, mediaCaption: value } }))}
            />
            <Field
              label="Stat Value"
              value={aboutPage.story.statValue}
              onChange={(value) => setAboutPage((prev) => ({ ...prev, story: { ...prev.story, statValue: value } }))}
            />
            <Field
              label="Stat Label"
              value={aboutPage.story.statLabel}
              onChange={(value) => setAboutPage((prev) => ({ ...prev, story: { ...prev.story, statLabel: value } }))}
            />
            {aboutPage.story.paragraphs.map((paragraph, index) => (
              <div key={`about-story-${index}`} className="md:col-span-2">
                <TextAreaField
                  label={`Paragraph ${index + 1}`}
                  value={paragraph}
                  rows={4}
                  onChange={(value) =>
                    setAboutPage((prev) => ({
                      ...prev,
                      story: {
                        ...prev.story,
                        paragraphs: prev.story.paragraphs.map((entry, entryIndex) => (entryIndex === index ? value : entry)),
                      },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </Category>

        <Category title="Details" description="Long-form About section. HTML is supported in the body field.">
          <div className="space-y-4">
            <Field
              label="Section Eyebrow"
              value={aboutPage.details.eyebrow}
              onChange={(value) => setAboutPage((prev) => ({ ...prev, details: { ...prev.details, eyebrow: value } }))}
            />
            <Field
              label="Section Heading"
              value={aboutPage.details.title}
              onChange={(value) => setAboutPage((prev) => ({ ...prev, details: { ...prev.details, title: value } }))}
            />
            <TextAreaField
              label={
                <>
                  Content <span className="text-slate-400">(HTML supported)</span>
                </>
              }
              value={aboutPage.details.contentHtml}
              rows={14}
              mono
              onChange={(value) => setAboutPage((prev) => ({ ...prev, details: { ...prev.details, contentHtml: value } }))}
            />
          </div>
        </Category>

        <Category title="Values" description="Section headings plus the value cards shown on the storefront.">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="Section Eyebrow"
                  value={aboutPage.values.eyebrow}
                  onChange={(value) => setAboutPage((prev) => ({ ...prev, values: { ...prev.values, eyebrow: value } }))}
                />
              </div>
              <div className="md:col-span-2">
                <Field
                  label="Section Heading"
                  value={aboutPage.values.title}
                  onChange={(value) => setAboutPage((prev) => ({ ...prev, values: { ...prev.values, title: value } }))}
                />
              </div>
              <div className="md:col-span-2">
                <TextAreaField
                  label="Intro"
                  value={aboutPage.values.intro}
                  onChange={(value) => setAboutPage((prev) => ({ ...prev, values: { ...prev.values, intro: value } }))}
                />
              </div>
            </div>

            <div className="divide-y divide-slate-200 border-t border-slate-200">
              {aboutPage.values.items.map((item, index) => (
                <div key={`about-value-${index}`} className="grid gap-4 py-5 md:grid-cols-2">
                  <Field
                    label={`Value ${index + 1} Title`}
                    value={item.title}
                    onChange={(value) =>
                      setAboutPage((prev) => ({
                        ...prev,
                        values: {
                          ...prev.values,
                          items: prev.values.items.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, title: value } : entry,
                          ),
                        },
                      }))
                    }
                  />
                  <TextAreaField
                    label={`Value ${index + 1} Description`}
                    value={item.description}
                    rows={4}
                    onChange={(value) =>
                      setAboutPage((prev) => ({
                        ...prev,
                        values: {
                          ...prev.values,
                          items: prev.values.items.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, description: value } : entry,
                          ),
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </Category>

        <Category title="Call To Action" description="Bottom section copy and destination link.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field
                label="Heading"
                value={aboutPage.cta.title}
                onChange={(value) => setAboutPage((prev) => ({ ...prev, cta: { ...prev.cta, title: value } }))}
              />
            </div>
            <div className="md:col-span-2">
              <TextAreaField
                label="Text"
                value={aboutPage.cta.text}
                onChange={(value) => setAboutPage((prev) => ({ ...prev, cta: { ...prev.cta, text: value } }))}
              />
            </div>
            <Field
              label="Button Label"
              value={aboutPage.cta.label}
              onChange={(value) => setAboutPage((prev) => ({ ...prev, cta: { ...prev.cta, label: value } }))}
            />
            <Field
              label="Button Link"
              value={aboutPage.cta.href}
              placeholder="/menu"
              onChange={(value) => setAboutPage((prev) => ({ ...prev, cta: { ...prev.cta, href: value } }))}
            />
          </div>
        </Category>
      </div>
    );
  }

  function renderContactEditor() {
    return (
      <div className="space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Contact Page</h2>
          <p className="mt-1 text-sm text-slate-500">
            Edit the Contact page by section while keeping business settings and the contact form functionality intact.
          </p>
        </div>

        <Category title="Hero" description="Top eyebrow, heading, and intro copy.">
          <div className="space-y-4">
            <Field
              label="Eyebrow"
              value={contactPage.hero.eyebrow}
              onChange={(value) => setContactPage((prev) => ({ ...prev, hero: { ...prev.hero, eyebrow: value } }))}
            />
            <Field
              label="Heading"
              value={contactPage.hero.title}
              onChange={(value) => setContactPage((prev) => ({ ...prev, hero: { ...prev.hero, title: value } }))}
            />
            <TextAreaField
              label="Intro"
              value={contactPage.hero.intro}
              onChange={(value) => setContactPage((prev) => ({ ...prev, hero: { ...prev.hero, intro: value } }))}
            />
          </div>
        </Category>

        <Category title="Contact Details" description="Left-column section headings, help text, fallbacks, and social links.">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Section Eyebrow"
                value={contactPage.details.eyebrow}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, eyebrow: value } }))}
              />
              <Field
                label="Section Heading"
                value={contactPage.details.title}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, title: value } }))}
              />
              <div className="md:col-span-2">
                <TextAreaField
                  label="Section Intro"
                  value={contactPage.details.intro}
                  onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, intro: value } }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Visit Title"
                value={contactPage.details.visitTitle}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, visitTitle: value } }))}
              />
              <TextAreaField
                label="Visit Supporting Text"
                value={contactPage.details.visitText}
                rows={4}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, visitText: value } }))}
              />
              {contactPage.details.fallbackAddressLines.map((line, index) => (
                <Field
                  key={`contact-address-${index}`}
                  label={`Fallback Address Line ${index + 1}`}
                  value={line}
                  onChange={(value) =>
                    setContactPage((prev) => ({
                      ...prev,
                      details: {
                        ...prev.details,
                        fallbackAddressLines: prev.details.fallbackAddressLines.map((entry, entryIndex) =>
                          entryIndex === index ? value : entry,
                        ),
                      },
                    }))
                  }
                />
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Call Title"
                value={contactPage.details.callTitle}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, callTitle: value } }))}
              />
              <TextAreaField
                label="Call Supporting Text"
                value={contactPage.details.callText}
                rows={4}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, callText: value } }))}
              />
              <Field
                label="Fallback Phone"
                value={contactPage.details.fallbackPhone}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, fallbackPhone: value } }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Email Title"
                value={contactPage.details.emailTitle}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, emailTitle: value } }))}
              />
              <TextAreaField
                label="Email Supporting Text"
                value={contactPage.details.emailText}
                rows={4}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, emailText: value } }))}
              />
              <Field
                label="Fallback Email"
                value={contactPage.details.fallbackEmail}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, fallbackEmail: value } }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Hours Title"
                value={contactPage.details.hoursTitle}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, hoursTitle: value } }))}
              />
              <TextAreaField
                label="Hours Supporting Text"
                value={contactPage.details.hoursText}
                rows={4}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, hoursText: value } }))}
              />
              {contactPage.details.fallbackHoursLines.map((line, index) => (
                <Field
                  key={`contact-hours-${index}`}
                  label={`Fallback Hours Line ${index + 1}`}
                  value={line}
                  onChange={(value) =>
                    setContactPage((prev) => ({
                      ...prev,
                      details: {
                        ...prev.details,
                        fallbackHoursLines: prev.details.fallbackHoursLines.map((entry, entryIndex) =>
                          entryIndex === index ? value : entry,
                        ),
                      },
                    }))
                  }
                />
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Follow Section Title"
                value={contactPage.details.followTitle}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, followTitle: value } }))}
              />
              <TextAreaField
                label="Follow Section Text"
                value={contactPage.details.followText}
                rows={4}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, followText: value } }))}
              />
              <Field
                label="Facebook URL"
                value={contactPage.details.facebookUrl}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, facebookUrl: value } }))}
              />
              <Field
                label="Instagram URL"
                value={contactPage.details.instagramUrl}
                onChange={(value) => setContactPage((prev) => ({ ...prev, details: { ...prev.details, instagramUrl: value } }))}
              />
            </div>
          </div>
        </Category>

        <Category title="Form" description="Form headings, field labels, placeholders, and success-state messages.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Form Eyebrow"
              value={contactPage.form.eyebrow}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, eyebrow: value } }))}
            />
            <Field
              label="Form Heading"
              value={contactPage.form.title}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, title: value } }))}
            />
            <div className="md:col-span-2">
              <TextAreaField
                label="Form Intro"
                value={contactPage.form.intro}
                onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, intro: value } }))}
              />
            </div>

            <Field
              label="Name Label"
              value={contactPage.form.nameLabel}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, nameLabel: value } }))}
            />
            <Field
              label="Name Placeholder"
              value={contactPage.form.namePlaceholder}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, namePlaceholder: value } }))}
            />
            <Field
              label="Email Label"
              value={contactPage.form.emailLabel}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, emailLabel: value } }))}
            />
            <Field
              label="Email Placeholder"
              value={contactPage.form.emailPlaceholder}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, emailPlaceholder: value } }))}
            />
            <Field
              label="Phone Label"
              value={contactPage.form.phoneLabel}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, phoneLabel: value } }))}
            />
            <Field
              label="Phone Optional Text"
              value={contactPage.form.phoneOptionalText}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, phoneOptionalText: value } }))}
            />
            <Field
              label="Phone Placeholder"
              value={contactPage.form.phonePlaceholder}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, phonePlaceholder: value } }))}
            />
            <Field
              label="Subject Label"
              value={contactPage.form.subjectLabel}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, subjectLabel: value } }))}
            />
            <Field
              label="Subject Placeholder"
              value={contactPage.form.subjectPlaceholder}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, subjectPlaceholder: value } }))}
            />
            <Field
              label="Message Label"
              value={contactPage.form.messageLabel}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, messageLabel: value } }))}
            />
            <Field
              label="Message Placeholder"
              value={contactPage.form.messagePlaceholder}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, messagePlaceholder: value } }))}
            />
            <Field
              label="Submit Button Label"
              value={contactPage.form.submitLabel}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, submitLabel: value } }))}
            />
            <Field
              label="Submitting Label"
              value={contactPage.form.submittingLabel}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, submittingLabel: value } }))}
            />
            <Field
              label="Success Heading"
              value={contactPage.form.successTitle}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, successTitle: value } }))}
            />
            <TextAreaField
              label="Success Text"
              value={contactPage.form.successText}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, successText: value } }))}
            />
            <Field
              label="Send Another Label"
              value={contactPage.form.sendAnotherLabel}
              onChange={(value) => setContactPage((prev) => ({ ...prev, form: { ...prev.form, sendAnotherLabel: value } }))}
            />
          </div>
        </Category>

        <Category title="Map" description="Bottom map section heading and placeholder copy.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Map Eyebrow"
              value={contactPage.map.eyebrow}
              onChange={(value) => setContactPage((prev) => ({ ...prev, map: { ...prev.map, eyebrow: value } }))}
            />
            <Field
              label="Map Heading"
              value={contactPage.map.title}
              onChange={(value) => setContactPage((prev) => ({ ...prev, map: { ...prev.map, title: value } }))}
            />
            <div className="md:col-span-2">
              <TextAreaField
                label="Map Intro"
                value={contactPage.map.intro}
                onChange={(value) => setContactPage((prev) => ({ ...prev, map: { ...prev.map, intro: value } }))}
              />
            </div>
            <div className="md:col-span-2">
              <TextAreaField
                label="Map Placeholder Text"
                value={contactPage.map.placeholderText}
                onChange={(value) => setContactPage((prev) => ({ ...prev, map: { ...prev.map, placeholderText: value } }))}
              />
            </div>
          </div>
        </Category>
      </div>
    );
  }

  function renderPolicyEditor(_slug: PolicySlug) {
    const slug = _slug;

    return (
      <div className="space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">{POLICY_FALLBACK_TITLES[slug]}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Edit this policy page by category so the hero, section headings, summaries, and bullet points stay organized.
          </p>
        </div>

        <Category title="Hero" description="Page eyebrow, title, intro, and update label.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Eyebrow"
              value={policyPage.hero.eyebrow}
              onChange={(value) => setPolicyPage((prev) => ({ ...prev, hero: { ...prev.hero, eyebrow: value } }))}
            />
            <Field
              label="Heading"
              value={policyPage.hero.title}
              onChange={(value) => setPolicyPage((prev) => ({ ...prev, hero: { ...prev.hero, title: value } }))}
            />
            <div className="md:col-span-2">
              <TextAreaField
                label="Intro"
                value={policyPage.hero.intro}
                onChange={(value) => setPolicyPage((prev) => ({ ...prev, hero: { ...prev.hero, intro: value } }))}
              />
            </div>
            <Field
              label="Updated Label"
              value={policyPage.hero.updatedLabel}
              onChange={(value) => setPolicyPage((prev) => ({ ...prev, hero: { ...prev.hero, updatedLabel: value } }))}
            />
            <Field
              label="Updated Date"
              value={policyPage.hero.updatedDate}
              onChange={(value) => setPolicyPage((prev) => ({ ...prev, hero: { ...prev.hero, updatedDate: value } }))}
            />
          </div>
        </Category>

        {policyPage.sections.map((section, index) => (
          <Category
            key={section.key}
            title={section.adminLabel}
            description="Edit the section heading, summary, and bullet points shown on the storefront."
          >
            <div className="space-y-4">
              <Field
                label="Section Heading"
                value={section.title}
                onChange={(value) =>
                  setPolicyPage((prev) => ({
                    ...prev,
                    sections: prev.sections.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, title: value } : entry,
                    ),
                  }))
                }
              />
              <TextAreaField
                label="Section Summary"
                value={section.description}
                rows={4}
                onChange={(value) =>
                  setPolicyPage((prev) => ({
                    ...prev,
                    sections: prev.sections.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, description: value } : entry,
                    ),
                  }))
                }
              />
              <div className="divide-y divide-slate-200 border-t border-slate-200">
                {section.items.map((item, itemIndex) => (
                  <div key={`${section.key}-item-${itemIndex}`} className="py-4">
                    <TextAreaField
                      label={`Bullet ${itemIndex + 1}`}
                      value={item}
                      rows={3}
                      onChange={(value) =>
                        setPolicyPage((prev) => ({
                          ...prev,
                          sections: prev.sections.map((entry, entryIndex) =>
                            entryIndex === index
                              ? {
                                  ...entry,
                                  items: entry.items.map((sectionItem, sectionItemIndex) =>
                                    sectionItemIndex === itemIndex ? value : sectionItem,
                                  ),
                                }
                              : entry,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </Category>
        ))}
      </div>
    );
  }

  function renderSelectedEditor() {
    if (selected === "about") return renderAboutEditor();
    if (selected === "contact") return renderContactEditor();
    if (selected && isPolicySlug(selected)) return renderPolicyEditor(selected);

    return (
      <div className="py-16 text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-2 text-sm text-slate-500">Select a page from the list to edit</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Edit your website pages and manage the announcement banner.
        </p>
      </div>

      <section className="border-t border-slate-200 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Megaphone className="h-5 w-5 text-amber-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Announcement Banner</h2>
            <p className="text-sm text-slate-500">Display a message at the top of your website</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={announcement.announcementActive}
                onChange={(e) => setAnnouncement((prev) => ({ ...prev, announcementActive: e.target.checked }))}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
            <span className="text-sm font-medium text-slate-700">
              {announcement.announcementActive ? "Active" : "Inactive"}
            </span>
          </div>

          <Field
            label="Banner Message"
            value={announcement.announcementText ?? ""}
            placeholder="e.g., Free delivery on orders over PHP 1,500"
            onChange={(value) => setAnnouncement((prev) => ({ ...prev, announcementText: value }))}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={announcement.announcementBgColor}
                onChange={(e) => setAnnouncement((prev) => ({ ...prev, announcementBgColor: e.target.value }))}
                className="h-10 w-14 cursor-pointer border border-slate-200"
              />
              <input
                type="text"
                value={announcement.announcementBgColor}
                onChange={(e) => setAnnouncement((prev) => ({ ...prev, announcementBgColor: e.target.value }))}
                className="w-32 border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {announcement.announcementText ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Preview</label>
              <div
                className="px-4 py-2.5 text-center text-sm font-medium text-white"
                style={{ backgroundColor: announcement.announcementBgColor }}
              >
                {announcement.announcementText}
              </div>
            </div>
          ) : null}

          <button
            onClick={saveAnnouncement}
            disabled={savingAnnouncement}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {savingAnnouncement ? "Saving..." : "Save Announcement"}
          </button>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <section className="border-t border-slate-200 pt-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">Pages</h3>
          <nav className="divide-y divide-slate-200">
            {DEFAULT_PAGES.map((page) => {
              const exists = pages.find((entry) => entry.slug === page.slug);
              const active = selected === page.slug;

              return (
                <button
                  key={page.slug}
                  onClick={() => selectPage(page.slug)}
                  className={`flex w-full items-center gap-3 border-l-2 px-0 py-3 text-left text-sm transition-colors ${
                    active ? "border-primary text-slate-900" : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{page.title}</p>
                    {exists ? (
                      <p className={`text-xs ${active ? "text-slate-600" : "text-slate-400"}`}>
                        Last edited {new Date(exists.updatedAt).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                  {!exists ? <Plus className={`ml-auto h-3.5 w-3.5 ${active ? "text-slate-600" : "text-slate-400"}`} /> : null}
                </button>
              );
            })}
          </nav>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <div className="space-y-4">
            {renderSelectedEditor()}

            {msg ? <p className={`text-sm ${msg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{msg}</p> : null}

            {selected ? (
              <button
                onClick={savePage}
                disabled={saving}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Page"}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
