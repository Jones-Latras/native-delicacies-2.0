"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, ShoppingBag, XCircle, MessageSquare, AlertTriangle } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, typeof ShoppingBag> = {
  NEW_ORDER: ShoppingBag,
  ORDER_CANCELLED: XCircle,
  CONTACT_MESSAGE: MessageSquare,
  LOW_STOCK: AlertTriangle,
};

const TYPE_COLORS: Record<string, string> = {
  NEW_ORDER: "text-blue-600 bg-blue-50",
  ORDER_CANCELLED: "text-red-600 bg-red-50",
  CONTACT_MESSAGE: "text-green-600 bg-green-50",
  LOW_STOCK: "text-amber-600 bg-amber-50",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data.notifications);
      setUnreadCount(json.data.unreadCount);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 0);
    const interval = setInterval(fetchNotifications, 30_000); // poll every 30s
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function markRead(id: string) {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                const colorClass = TYPE_COLORS[n.type] || "text-slate-600 bg-slate-50";
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.isRead && markRead(n.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${!n.isRead ? "bg-primary/5" : ""}`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.isRead ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{n.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
