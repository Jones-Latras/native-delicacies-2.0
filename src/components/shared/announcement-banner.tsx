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
      className="relative flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white"
      style={{ backgroundColor: announcement.bgColor }}
    >
      <span className="text-center">{announcement.text}</span>
      <button
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem("announcement-dismissed", "true");
        }}
        className="absolute right-3 rounded p-0.5 text-white/80 transition-colors hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
