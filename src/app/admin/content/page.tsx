"use client";

import { useState, useEffect, useCallback } from "react";
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
  { slug: "delivery", title: "Delivery Areas & Fees" },
  { slug: "refund", title: "Refund & Cancellation Policy" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
];

export default function AdminContentPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Announcement state
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
    const page = pages.find((p) => p.slug === slug);
    if (page) {
      setTitle(page.title);
      setContent(page.content);
    } else {
      const def = DEFAULT_PAGES.find((d) => d.slug === slug);
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
        setMsg("Saved successfully!");
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
      setMsg("Announcement saved!");
    } catch {
      setMsg("Failed to save announcement");
    } finally {
      setSavingAnnouncement(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Edit your website pages and manage the announcement banner.
        </p>
      </div>

      {/* Announcement Banner Section */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Megaphone className="h-5 w-5" />
          </div>
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
                onChange={(e) =>
                  setAnnouncement((a) => ({ ...a, announcementActive: e.target.checked }))
                }
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
            <span className="text-sm font-medium text-slate-700">
              {announcement.announcementActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Banner Message</label>
            <input
              type="text"
              value={announcement.announcementText ?? ""}
              onChange={(e) =>
                setAnnouncement((a) => ({ ...a, announcementText: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="e.g., Free delivery on orders over ₱1,500! 🎉"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={announcement.announcementBgColor}
                onChange={(e) =>
                  setAnnouncement((a) => ({ ...a, announcementBgColor: e.target.value }))
                }
                className="h-10 w-14 cursor-pointer rounded border border-slate-200"
              />
              <input
                type="text"
                value={announcement.announcementBgColor}
                onChange={(e) =>
                  setAnnouncement((a) => ({ ...a, announcementBgColor: e.target.value }))
                }
                className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Preview */}
          {announcement.announcementText && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preview</label>
              <div
                className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white"
                style={{ backgroundColor: announcement.announcementBgColor }}
              >
                {announcement.announcementText}
              </div>
            </div>
          )}

          <button
            onClick={saveAnnouncement}
            disabled={savingAnnouncement}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {savingAnnouncement ? "Saving..." : "Save Announcement"}
          </button>
        </div>
      </div>

      {/* Page Editor */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Page List */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Pages</h3>
            </div>
            <nav className="p-2">
              {DEFAULT_PAGES.map((page) => {
                const exists = pages.find((p) => p.slug === page.slug);
                return (
                  <button
                    key={page.slug}
                    onClick={() => selectPage(page.slug)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      selected === page.slug
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{page.title}</p>
                      {exists && (
                        <p className={`text-xs ${selected === page.slug ? "text-white/70" : "text-slate-400"}`}>
                          Last edited {new Date(exists.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {!exists && (
                      <Plus className={`ml-auto h-3.5 w-3.5 ${selected === page.slug ? "text-white/70" : "text-slate-400"}`} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Content <span className="text-slate-400">(HTML supported)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="Enter page content here. HTML tags are supported for formatting."
                />
              </div>

              {msg && (
                <p className={`mb-4 text-sm ${msg.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                  {msg}
                </p>
              )}

              <button
                onClick={savePage}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Page"}
              </button>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">Select a page from the sidebar to edit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
