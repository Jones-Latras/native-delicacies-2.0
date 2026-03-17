"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Facebook, Instagram } from "lucide-react";

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

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (!res.ok) return;

        const json = await res.json();
        if (isMounted && json?.data) {
          setContactSettings(json.data);
        }
      } catch {
        // Keep current fallback UI when settings fetch fails.
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const address = contactSettings?.address;
  const addressLines = [address?.street, [address?.city, address?.state, address?.postalCode].filter(Boolean).join(", ")]
    .filter((line) => line && line.trim().length > 0) as string[];

  const formatDayHours = (day: string) => {
    const dayInfo = contactSettings?.operatingHours?.[day];
    if (!dayInfo || dayInfo.isClosed || !dayInfo.slots?.[0]) return "Closed";
    const slot = dayInfo.slots[0];
    return `${slot.open} - ${slot.close}`;
  };

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Get In Touch</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Contact Us
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-stone-500">
          Have a question, special order request, or just want to say hello? We&rsquo;d love to hear from you.
        </p>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-5">
        {/* Contact Info */}
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Visit Us</h3>
                <p className="mt-1 text-sm text-stone-500">
                  {addressLines.length > 0 ? (
                    addressLines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))
                  ) : (
                    <>
                      123 Heritage Street, Barangay San Jose<br />
                      Quezon City, Metro Manila 1100
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Call Us</h3>
                <p className="mt-1 text-sm text-stone-500">
                  {contactSettings?.phone || "+63 917 123 4567"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Email Us</h3>
                <p className="mt-1 text-sm text-stone-500">
                  {contactSettings?.email || "hello@jjnativedelicacies.ph"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Business Hours</h3>
                <p className="mt-1 text-sm text-stone-500">
                  Monday: {formatDayHours("monday")}<br />
                  Tuesday: {formatDayHours("tuesday")}<br />
                  Wednesday: {formatDayHours("wednesday")}<br />
                  Thursday: {formatDayHours("thursday")}<br />
                  Friday: {formatDayHours("friday")}<br />
                  Saturday: {formatDayHours("saturday")}<br />
                  Sunday: {formatDayHours("sunday")}
                </p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900">Follow Us</h3>
            <div className="mt-3 flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-stone-100 bg-white p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-stone-900">Message Sent!</h2>
                <p className="mt-2 text-stone-500">
                  Thank you for reaching out. We&rsquo;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="mt-6 text-sm font-medium text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
                      Phone <span className="text-stone-400">(optional)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      placeholder="+63 917 123 4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-stone-700">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      placeholder="What is this about?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-stone-700">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm text-stone-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Map Embed Placeholder */}
      <div className="mt-16">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          <div className="flex h-80 items-center justify-center text-stone-400">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-stone-300" />
              <p className="mt-2 text-sm">
                Google Maps embed — configure with your Google Maps API key
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
