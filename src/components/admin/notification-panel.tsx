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
  NEW_ORDER: "bg-pulot/14 text-pulot",
  ORDER_CANCELLED: "bg-red-900/10 text-red-800/85",
  CONTACT_MESSAGE: "bg-pandan/14 text-pandan",
  LOW_STOCK: "bg-amber-100 text-amber-700",
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
        className="relative rounded-full border border-latik/15 bg-asukal/80 p-2.5 text-latik transition-all duration-300 ease-in-out hover:border-pulot/30 hover:bg-pulot/10 hover:text-pulot"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pulot px-1 text-[10px] font-bold text-asukal shadow-[0_8px_16px_rgba(59,31,14,0.18)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-96 overflow-hidden rounded-[1.5rem] border border-latik/15 bg-asukal/96 shadow-[0_24px_44px_rgba(59,31,14,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-latik/10 px-5 py-4">
            <h3 className="font-[family-name:var(--font-display)] text-lg text-kape">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-latik transition-colors duration-300 hover:text-pulot"
              >
                <Check className="h-3 w-3" strokeWidth={1.5} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-latik/55">
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
                    className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-all duration-300 ease-in-out hover:bg-kape/4 ${!n.isRead ? "bg-pulot/8" : ""}`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.isRead ? "font-semibold text-kape" : "text-latik/80"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-latik/65">{n.message}</p>
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-latik/42">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-pulot" />
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
