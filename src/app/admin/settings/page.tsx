"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Store, Clock, Truck, CreditCard } from "lucide-react";

interface SettingsData {
  businessName: string;
  phone: string;
  email: string;
  address: { street: string; city: string; state: string; postalCode: string };
  operatingHours: Record<string, { isClosed: boolean; slots: { open: string; close: string }[] }>;
  deliveryFee: number;
  minimumOrder: number;
  freeDeliveryThreshold: number | null;
  isAcceptingOrders: boolean;
  taxRate: number;
  timezone: string;
  aboutText: string | null;
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

const defaultHours = () => Object.fromEntries(DAYS.map((d) => [d, { isClosed: false, slots: [{ open: "08:00", close: "20:00" }] }]));

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [section, setSection] = useState<"general" | "hours" | "delivery" | "payment">("general");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const d = json.data;
          setSettings({
            businessName: d.businessName || "",
            phone: d.phone || "",
            email: d.email || "",
            address: d.address && typeof d.address === "object" ? d.address : { street: "", city: "", state: "", postalCode: "" },
            operatingHours: d.operatingHours && typeof d.operatingHours === "object" && Object.keys(d.operatingHours).length > 0 ? d.operatingHours : defaultHours(),
            deliveryFee: d.deliveryFee ?? 0,
            minimumOrder: d.minimumOrder ?? 0,
            freeDeliveryThreshold: d.freeDeliveryThreshold,
            isAcceptingOrders: d.isAcceptingOrders ?? true,
            taxRate: d.taxRate ?? 0,
            timezone: d.timezone || "Asia/Manila",
            aboutText: d.aboutText || "",
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      setError(json.error || "Failed to save");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !settings) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[#8b4513]" size={28} /></div>;
  }

  const set = (key: keyof SettingsData, val: unknown) => setSettings((p) => p ? { ...p, [key]: val } : p);
  const setAddr = (key: string, val: string) => setSettings((p) => p ? { ...p, address: { ...p.address, [key]: val } } : p);

  const sectionBtn = (s: typeof section, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setSection(s)}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        section === s
          ? "bg-[#8b4513] text-white"
          : "text-[#6d4c41] hover:bg-[#f5f0eb]"
      }`}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3e2723]">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#8b4513] px-4 py-2 text-sm font-medium text-white hover:bg-[#a0522d] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      {saved && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Settings saved successfully!</p>}

      {/* Section Nav */}
      <div className="flex flex-wrap gap-2">
        {sectionBtn("general", <Store size={16} />, "General")}
        {sectionBtn("hours", <Clock size={16} />, "Operating Hours")}
        {sectionBtn("delivery", <Truck size={16} />, "Delivery & Orders")}
        {sectionBtn("payment", <CreditCard size={16} />, "Tax & Payment")}
      </div>

      <div className="rounded-xl border border-[#e8e0d8] bg-white p-6">
        {section === "general" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3e2723]">General Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Business Name</label>
                <input value={settings.businessName} onChange={(e) => set("businessName", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Phone</label>
                <input value={settings.phone} onChange={(e) => set("phone", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Email</label>
                <input type="email" value={settings.email} onChange={(e) => set("email", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Timezone</label>
                <input value={settings.timezone} onChange={(e) => set("timezone", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-[#5d4037] pt-2">Address</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Street</label>
                <input value={settings.address.street} onChange={(e) => setAddr("street", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">City</label>
                <input value={settings.address.city} onChange={(e) => setAddr("city", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Postal Code</label>
                <input value={settings.address.postalCode} onChange={(e) => setAddr("postalCode", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">About Text</label>
              <textarea rows={3} value={settings.aboutText ?? ""} onChange={(e) => set("aboutText", e.target.value)} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#5d4037]">
              <input type="checkbox" checked={settings.isAcceptingOrders} onChange={(e) => set("isAcceptingOrders", e.target.checked)} className="rounded" />
              Currently accepting orders
            </label>
          </div>
        )}

        {section === "hours" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3e2723]">Operating Hours</h2>
            {DAYS.map((day) => {
              const dayData = settings.operatingHours[day] || { isClosed: false, slots: [{ open: "08:00", close: "20:00" }] };
              return (
                <div key={day} className="flex flex-wrap items-center gap-4 rounded-lg border border-[#e8e0d8] p-3">
                  <span className="w-24 text-sm font-medium text-[#3e2723]">{DAY_LABELS[day]}</span>
                  <label className="flex items-center gap-1.5 text-sm text-[#6d4c41]">
                    <input
                      type="checkbox"
                      checked={dayData.isClosed}
                      onChange={(e) => {
                        const hours = { ...settings.operatingHours };
                        hours[day] = { ...dayData, isClosed: e.target.checked };
                        set("operatingHours", hours);
                      }}
                      className="rounded"
                    />
                    Closed
                  </label>
                  {!dayData.isClosed && dayData.slots[0] && (
                    <>
                      <input
                        type="time"
                        value={dayData.slots[0].open}
                        onChange={(e) => {
                          const hours = { ...settings.operatingHours };
                          hours[day] = { ...dayData, slots: [{ ...dayData.slots[0], open: e.target.value }] };
                          set("operatingHours", hours);
                        }}
                        className="rounded-lg border border-[#d7ccc8] px-2 py-1.5 text-sm focus:border-[#8b4513] focus:outline-none"
                      />
                      <span className="text-sm text-[#a1887f]">to</span>
                      <input
                        type="time"
                        value={dayData.slots[0].close}
                        onChange={(e) => {
                          const hours = { ...settings.operatingHours };
                          hours[day] = { ...dayData, slots: [{ ...dayData.slots[0], close: e.target.value }] };
                          set("operatingHours", hours);
                        }}
                        className="rounded-lg border border-[#d7ccc8] px-2 py-1.5 text-sm focus:border-[#8b4513] focus:outline-none"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {section === "delivery" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3e2723]">Delivery & Orders</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Delivery Fee (₱)</label>
                <input type="number" step="0.01" min="0" value={settings.deliveryFee} onChange={(e) => set("deliveryFee", Number(e.target.value))} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Minimum Order (₱)</label>
                <input type="number" step="0.01" min="0" value={settings.minimumOrder} onChange={(e) => set("minimumOrder", Number(e.target.value))} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#5d4037]">Free Delivery Threshold (₱)</label>
                <input type="number" step="0.01" min="0" value={settings.freeDeliveryThreshold ?? ""} onChange={(e) => set("freeDeliveryThreshold", e.target.value ? Number(e.target.value) : null)} placeholder="No threshold" className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
              </div>
            </div>
          </div>
        )}

        {section === "payment" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#3e2723]">Tax & Payment</h2>
            <div className="max-w-xs">
              <label className="mb-1 block text-sm font-medium text-[#5d4037]">Tax Rate (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={settings.taxRate} onChange={(e) => set("taxRate", Number(e.target.value))} className="w-full rounded-lg border border-[#d7ccc8] px-3 py-2 text-sm focus:border-[#8b4513] focus:outline-none focus:ring-1 focus:ring-[#8b4513]" />
            </div>
            <p className="text-sm text-[#a1887f]">Payment methods (Card, Cash on Delivery, Cash at Pickup) are system defaults. Stripe configuration is managed via environment variables.</p>
          </div>
        )}
      </div>
    </div>
  );
}
