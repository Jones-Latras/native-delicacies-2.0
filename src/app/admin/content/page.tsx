"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Save, Plus, Megaphone } from "lucide-react";

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
];

const inputClass =
  "w-full border border-slate-200 bg-transparent px-4 py-2.5 text-sm focus:border-primary focus:outline-none";

export default function AdminContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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
  }, [fetchPages, fetchAnnouncement]);

  function selectPage(slug: string) {
    setSelected(slug);
    const page = pages.find((entry) => entry.slug === slug);
    if (page) {
      setTitle(page.title);
      setContent(page.content);
    } else {
      const def = DEFAULT_PAGES.find((entry) => entry.slug === slug);
      setTitle(def?.title ?? slug);
      setContent("");
    }
    setMsg(null);
  }

  async function savePage() {
    if (!selected) return;
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selected, title, content }),
      });

      if (res.ok) {
        setMsg("Saved successfully.");
        fetchPages();
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Banner Message</label>
            <input
              type="text"
              value={announcement.announcementText ?? ""}
              onChange={(e) => setAnnouncement((prev) => ({ ...prev, announcementText: e.target.value }))}
              className={inputClass}
              placeholder="e.g., Free delivery on orders over PHP 1,500"
            />
          </div>

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

          {announcement.announcementText && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Preview</label>
              <div
                className="px-4 py-2.5 text-center text-sm font-medium text-white"
                style={{ backgroundColor: announcement.announcementBgColor }}
              >
                {announcement.announcementText}
              </div>
            </div>
          )}

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
                    {exists && (
                      <p className={`text-xs ${active ? "text-slate-600" : "text-slate-400"}`}>
                        Last edited {new Date(exists.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {!exists && <Plus className={`ml-auto h-3.5 w-3.5 ${active ? "text-slate-600" : "text-slate-400"}`} />}
                </button>
              );
            })}
          </nav>
        </section>

        <section className="border-t border-slate-200 pt-6">
          {selected ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Page Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Content <span className="text-slate-400">(HTML supported)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full border border-slate-200 px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none"
                  placeholder="Enter page content here. HTML tags are supported for formatting."
                />
              </div>

              {msg && (
                <p className={`text-sm ${msg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                  {msg}
                </p>
              )}

              <button
                onClick={savePage}
                disabled={saving}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Page"}
              </button>
            </div>
          ) : (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">Select a page from the list to edit</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
