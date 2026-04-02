"use client";

import { useState } from "react";
import { CheckCircle, Clock, Facebook, Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
import type { ContactPageContent } from "@/lib/contact-content";

interface ContactSettings {
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  operatingHours?: Record<string, { isClosed: boolean; slots: { open: string; close: string }[] }>;
}

interface ContactClientProps {
  content: ContactPageContent;
  contactSettings: ContactSettings | null;
}

export function ContactClient({ content, contactSettings }: ContactClientProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = contactSettings?.address;
  const addressLines =
    [address?.street, [address?.city, address?.state, address?.postalCode].filter(Boolean).join(", ")]
      .filter((line) => line && line.trim().length > 0)
      .map((line) => line.trim()) || [];
  const resolvedAddressLines =
    addressLines.length > 0 ? addressLines : content.details.fallbackAddressLines.filter((line) => line.trim().length > 0);

  const formatDayHours = (day: string) => {
    const dayInfo = contactSettings?.operatingHours?.[day];
    if (!dayInfo || dayInfo.isClosed || !dayInfo.slots?.[0]) return null;

    const slot = dayInfo.slots[0];
    return `${day.charAt(0).toUpperCase()}${day.slice(1)}: ${slot.open} - ${slot.close}`;
  };

  const resolvedHoursLines = [
    formatDayHours("monday"),
    formatDayHours("tuesday"),
    formatDayHours("wednesday"),
    formatDayHours("thursday"),
    formatDayHours("friday"),
    formatDayHours("saturday"),
    formatDayHours("sunday"),
  ].filter((line): line is string => Boolean(line));
  const hoursLines =
    resolvedHoursLines.length > 0
      ? resolvedHoursLines
      : content.details.fallbackHoursLines.filter((line) => line.trim().length > 0);

  const inputClass =
    "mt-1.5 w-full border-b border-stone-200 bg-transparent px-0 py-2.5 text-sm text-stone-900 focus:border-primary focus:outline-none";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="artisan-contact mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-latik/15 px-8 pb-12 text-center sm:px-12 sm:pb-16">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-pulot">{content.hero.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-kape sm:text-5xl">{content.hero.title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-latik/76">{content.hero.intro}</p>
      </div>

      <div className="section-divider mt-16 grid gap-12 pt-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="border-t border-latik/14 pt-5">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pulot">{content.details.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-black text-kape">{content.details.title}</h2>
            <p className="mt-3 text-sm leading-7 text-latik/72">{content.details.intro}</p>
          </div>

          <div className="mt-6 space-y-5">
            <div className="flex items-start gap-4 border-t border-latik/14 pt-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{content.details.visitTitle}</h3>
                <p className="mt-1 text-sm leading-7 text-stone-500">{content.details.visitText}</p>
                <div className="mt-2 text-sm text-stone-500">
                  {resolvedAddressLines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 border-t border-latik/14 pt-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{content.details.callTitle}</h3>
                <p className="mt-1 text-sm leading-7 text-stone-500">{content.details.callText}</p>
                <p className="mt-2 text-sm text-stone-500">{contactSettings?.phone || content.details.fallbackPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-t border-latik/14 pt-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{content.details.emailTitle}</h3>
                <p className="mt-1 text-sm leading-7 text-stone-500">{content.details.emailText}</p>
                <p className="mt-2 text-sm text-stone-500">{contactSettings?.email || content.details.fallbackEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-t border-latik/14 pt-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{content.details.hoursTitle}</h3>
                <p className="mt-1 text-sm leading-7 text-stone-500">{content.details.hoursText}</p>
                <div className="mt-2 text-sm text-stone-500">
                  {hoursLines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-latik/14 pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900">{content.details.followTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-stone-500">{content.details.followText}</p>
            <div className="mt-3 flex gap-3">
              {content.details.facebookUrl.trim().length > 0 ? (
                <a
                  href={content.details.facebookUrl}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              ) : null}
              {content.details.instagramUrl.trim().length > 0 ? (
                <a
                  href={content.details.instagramUrl}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="border-t border-latik/14 pt-8">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pulot">{content.form.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-black text-kape">{content.form.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-latik/72">{content.form.intro}</p>

            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-stone-900">{content.form.successTitle}</h3>
                <p className="mt-2 text-stone-500">{content.form.successText}</p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="mt-6 text-sm font-medium text-primary hover:underline"
                >
                  {content.form.sendAnotherLabel}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error ? <div className="border-l-2 border-red-300 pl-3 text-sm text-red-700">{error}</div> : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                      {content.form.nameLabel}
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                      className={inputClass}
                      placeholder={content.form.namePlaceholder}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                      {content.form.emailLabel}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                      className={inputClass}
                      placeholder={content.form.emailPlaceholder}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
                      {content.form.phoneLabel}{" "}
                      {content.form.phoneOptionalText.trim().length > 0 ? (
                        <span className="text-stone-400">{content.form.phoneOptionalText}</span>
                      ) : null}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
                      className={inputClass}
                      placeholder={content.form.phonePlaceholder}
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-stone-700">
                      {content.form.subjectLabel}
                    </label>
                    <input
                      id="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))}
                      className={inputClass}
                      placeholder={content.form.subjectPlaceholder}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-stone-700">
                    {content.form.messageLabel}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
                    className={inputClass}
                    placeholder={content.form.messagePlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? content.form.submittingLabel : content.form.submitLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-latik/14 pt-8">
        <div className="text-center">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pulot">{content.map.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-black text-kape">{content.map.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-latik/72">{content.map.intro}</p>
        </div>
        <div className="mt-8 flex h-80 items-center justify-center text-stone-400">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-stone-300" />
            <p className="mt-2 text-sm">{content.map.placeholderText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
