"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<{ text: string; bgColor: string } | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("announcement-dismissed") === "true";
  });

  useEffect(() => {
    if (dismissed) return;

    fetch("/api/announcement")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setAnnouncement(json.data);
        }
      })
      .catch(() => {});
  }, [dismissed]);

  if (dismissed || !announcement) return null;

  return (
    <div
      className="relative isolate flex items-center justify-center overflow-hidden border-b border-kape/10 px-4 py-3 text-center text-[0.72rem] font-medium uppercase tracking-[0.28em] text-asukal shadow-[0_10px_24px_rgba(59,31,14,0.12)]"
      style={{ backgroundColor: announcement.bgColor }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_28%,rgba(59,31,14,0.14))]"
      />
      <span className="relative z-10 text-center">{announcement.text}</span>
      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem("announcement-dismissed", "true");
        }}
        className="absolute right-3 z-10 rounded-full border border-white/20 bg-white/10 p-1 text-white/82 transition-all duration-300 ease-in-out hover:bg-white/18 hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
