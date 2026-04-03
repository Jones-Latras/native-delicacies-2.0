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
    [
      address?.street,
      [address?.city, address?.state, address?.postalCode].filter(Boolean).join(", "),
    ]
      .filter((line): line is string => typeof line === "string" && line.trim().length > 0)
      .map((line) => line.trim()) || [];
  const resolvedAddressLines =
    addressLines.length > 0
      ? addressLines
      : content.details.fallbackAddressLines.filter((line) => line.trim().length > 0);
  const mapQuery = resolvedAddressLines.join(", ").trim();
  const googleMapsEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`
    : null;
  const googleMapsDirectionsUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;

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
    "mt-2 w-full rounded-[12px] border border-[#C9A87C] bg-[#FFFDF8] px-4 py-3 font-[family-name:var(--font-label)] text-sm text-[#3E2012] transition-colors duration-200 ease-in-out placeholder:text-[#7A6A55] focus:border-[#A0522D] focus:outline-none";

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
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFDF8_0%,#FAF6F0_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C9A87C]/60" />
      <div className="pointer-events-none absolute left-[10%] top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(245,230,200,0.65),transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-10 right-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(160,82,45,0.10),transparent_72%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
            {content.hero.eyebrow}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.25rem] leading-tight text-[#3E2012] sm:text-[3rem]">
            {content.hero.title}
          </h1>
          <div className="mx-auto mt-4 h-[2px] w-[60px] rounded-full bg-[#A0522D]" />
          <p className="mx-auto mt-5 max-w-xl font-[family-name:var(--font-label)] text-base italic leading-7 text-[#7A6A55]">
            {content.hero.intro}
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-8 shadow-[0_18px_40px_rgba(90,50,20,0.06)]">
              <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                {content.details.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[#3E2012]">
                {content.details.title}
              </h2>
              <p className="mt-3 font-[family-name:var(--font-label)] text-sm leading-7 text-[#7A6A55]">
                {content.details.intro}
              </p>

              <div className="mt-6 space-y-4">
                <ContactInfoBlock
                  icon={<MapPin className="h-5 w-5" />}
                  title={content.details.visitTitle}
                  text={content.details.visitText}
                >
                  {resolvedAddressLines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </ContactInfoBlock>

                <ContactInfoBlock
                  icon={<Phone className="h-5 w-5" />}
                  title={content.details.callTitle}
                  text={content.details.callText}
                >
                  <span>{contactSettings?.phone || content.details.fallbackPhone}</span>
                </ContactInfoBlock>

                <ContactInfoBlock
                  icon={<Mail className="h-5 w-5" />}
                  title={content.details.emailTitle}
                  text={content.details.emailText}
                >
                  <span>{contactSettings?.email || content.details.fallbackEmail}</span>
                </ContactInfoBlock>

                <ContactInfoBlock
                  icon={<Clock className="h-5 w-5" />}
                  title={content.details.hoursTitle}
                  text={content.details.hoursText}
                >
                  {hoursLines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </ContactInfoBlock>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#C9A87C] bg-[linear-gradient(135deg,#F5EFE6_0%,#FFFDF8_100%)] p-8 shadow-[0_18px_40px_rgba(90,50,20,0.06)]">
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                {content.details.followTitle}
              </h3>
              <p className="mt-3 font-[family-name:var(--font-label)] text-sm leading-7 text-[#7A6A55]">
                {content.details.followText}
              </p>
              <div className="mt-4 flex gap-3">
                {content.details.facebookUrl.trim().length > 0 ? (
                  <a
                    href={content.details.facebookUrl}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A87C] bg-[#FFFDF8] text-[#A0522D] transition-all duration-200 ease-in-out hover:border-[#A0522D] hover:bg-[#A0522D] hover:text-white"
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
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A87C] bg-[#FFFDF8] text-[#A0522D] transition-all duration-200 ease-in-out hover:border-[#A0522D] hover:bg-[#A0522D] hover:text-white"
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

          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-8 shadow-[0_18px_40px_rgba(90,50,20,0.06)]">
              <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                {content.form.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[#3E2012]">
                {content.form.title}
              </h2>
              <p className="mt-3 max-w-2xl font-[family-name:var(--font-label)] text-sm leading-7 text-[#7A6A55]">
                {content.form.intro}
              </p>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF5E7] text-[#3A6A1E]">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[#3E2012]">
                    {content.form.successTitle}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-label)] text-[#7A6A55]">
                    {content.form.successText}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                    }}
                    className="mt-6 font-[family-name:var(--font-label)] text-sm text-[#A0522D] underline decoration-[#A0522D]/45 underline-offset-4 transition-colors duration-200 ease-in-out hover:text-[#7D3D1A]"
                  >
                    {content.form.sendAnotherLabel}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {error ? (
                    <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 font-[family-name:var(--font-label)] text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="name"
                      label={content.form.nameLabel}
                      value={form.name}
                      required
                      placeholder={content.form.namePlaceholder}
                      className={inputClass}
                      onChange={(value) => setForm((current) => ({ ...current, name: value }))}
                    />
                    <Field
                      id="email"
                      label={content.form.emailLabel}
                      type="email"
                      value={form.email}
                      required
                      placeholder={content.form.emailPlaceholder}
                      className={inputClass}
                      onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      id="phone"
                      label={`${content.form.phoneLabel}${content.form.phoneOptionalText.trim().length > 0 ? ` ${content.form.phoneOptionalText}` : ""}`}
                      value={form.phone}
                      placeholder={content.form.phonePlaceholder}
                      className={inputClass}
                      onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
                    />
                    <Field
                      id="subject"
                      label={content.form.subjectLabel}
                      value={form.subject}
                      required
                      placeholder={content.form.subjectPlaceholder}
                      className={inputClass}
                      onChange={(value) => setForm((current) => ({ ...current, subject: value }))}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="font-[family-name:var(--font-label)] text-sm font-medium text-[#5C3D1E]"
                    >
                      {content.form.messageLabel}
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={(e) =>
                        setForm((current) => ({ ...current, message: e.target.value }))
                      }
                      className={inputClass}
                      placeholder={content.form.messagePlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-[#A0522D] px-6 py-3 font-[family-name:var(--font-label)] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-[#7D3D1A] disabled:cursor-not-allowed disabled:bg-[#C9A87C]"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? content.form.submittingLabel : content.form.submitLabel}
                  </button>
                </form>
              )}
            </div>

            <div className="rounded-[24px] border border-[#C9A87C] bg-[#FFFDF8] p-8 text-center shadow-[0_18px_40px_rgba(90,50,20,0.06)]">
              <p className="font-[family-name:var(--font-label)] text-xs font-medium uppercase tracking-[0.1em] text-[#A0522D]">
                {content.map.eyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[2rem] leading-tight text-[#3E2012]">
                {content.map.title}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl font-[family-name:var(--font-label)] text-sm leading-7 text-[#7A6A55]">
                {content.map.intro}
              </p>
              {googleMapsEmbedUrl ? (
                <>
                  <div className="mt-8 overflow-hidden rounded-[20px] border border-[#C9A87C] bg-[#F5EFE6] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                    <iframe
                      title={`${content.map.title} - Google Maps`}
                      src={googleMapsEmbedUrl}
                      className="h-72 w-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="mt-5 flex flex-col items-center gap-3">
                    <p className="font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
                      {mapQuery}
                    </p>
                    <a
                      href={googleMapsDirectionsUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#A0522D] px-5 py-2.5 font-[family-name:var(--font-label)] text-sm font-medium text-[#A0522D] transition-all duration-200 ease-in-out hover:bg-[#A0522D] hover:text-white"
                    >
                      <MapPin className="h-4 w-4" />
                      Open in Google Maps
                    </a>
                  </div>
                </>
              ) : (
                <div className="mt-8 flex h-72 items-center justify-center rounded-[20px] border border-dashed border-[#C9A87C] bg-[#F5EFE6] text-[#7A6A55]">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-[#A0522D]" />
                    <p className="mt-3 font-[family-name:var(--font-label)] text-sm">
                      {content.map.placeholderText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactInfoBlock({
  icon,
  title,
  text,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-[#C9A87C] bg-[#FAF6F0] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5E6C8] text-[#A0522D]">
          {icon}
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl text-[#3E2012]">{title}</h3>
          <p className="mt-1 font-[family-name:var(--font-label)] text-sm leading-7 text-[#7A6A55]">
            {text}
          </p>
          <div className="mt-2 font-[family-name:var(--font-label)] text-sm text-[#7A6A55]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  className,
  placeholder,
  required,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-[family-name:var(--font-label)] text-sm font-medium text-[#5C3D1E]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
      />
    </div>
  );
}
