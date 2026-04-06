"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Banknote,
  ChevronRight,
  Clock,
  Gift,
  Loader2,
  MapPin,
  ShoppingBag,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn, formatCurrency } from "@/lib/utils";
import type { BusinessSettings, CartItem } from "@/types";

interface CheckoutForm {
  orderType: "DELIVERY" | "PICKUP";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    deliveryInstructions: string;
  };
  scheduledTime: string;
  isGift: boolean;
  giftMessage: string;
  specialInstructions: string;
  paymentMethod: "CARD" | "CASH_ON_DELIVERY" | "CASH_AT_PICKUP";
  tip: number;
}

interface FieldErrors {
  [key: string]: string;
}

const TIP_PRESETS = [0, 20, 50, 100];

export function CheckoutClient() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const clearCart = useCartStore((s) => s.clearCart);

  const [form, setForm] = useState<CheckoutForm>({
    orderType: "DELIVERY",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      deliveryInstructions: "",
    },
    scheduledTime: "",
    isGift: false,
    giftMessage: "",
    specialInstructions: "",
    paymentMethod: "CARD",
    tip: 0,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [customTip, setCustomTip] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        customerName: session.user.name || f.customerName,
        customerEmail: session.user.email || f.customerEmail,
      }));
    }
  }, [session]);

  useEffect(() => {
    if (hasMounted && items.length === 0) {
      router.push("/menu");
    }
  }, [hasMounted, items.length, router]);

  const deliveryFee =
    form.orderType === "DELIVERY"
      ? settings?.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold
        ? 0
        : settings?.deliveryFee ?? 0
      : 0;

  const taxRate = settings?.taxRate ?? 0;
  const taxAmount = subtotal * (taxRate / 100);
  const tipAmount = form.tip;
  const total = subtotal - promoDiscount + deliveryFee + taxAmount + tipAmount;

  function updateField<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const copy = { ...e };
      delete copy[key];
      return copy;
    });
  }

  function updateAddress(key: keyof CheckoutForm["deliveryAddress"], value: string) {
    setForm((f) => ({
      ...f,
      deliveryAddress: { ...f.deliveryAddress, [key]: value },
    }));
    setErrors((e) => {
      const copy = { ...e };
      delete copy[`deliveryAddress.${key}`];
      return copy;
    });
  }

  function validate(): boolean {
    const e: FieldErrors = {};

    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!form.customerEmail.trim() || !/\S+@\S+\.\S+/.test(form.customerEmail)) {
      e.customerEmail = "Valid email is required";
    }
    if (!form.customerPhone.trim() || form.customerPhone.replace(/\D/g, "").length < 10) {
      e.customerPhone = "Valid phone number is required";
    }

    if (form.orderType === "DELIVERY") {
      if (!form.deliveryAddress.street.trim()) {
        e["deliveryAddress.street"] = "Street address is required";
      }
      if (!form.deliveryAddress.city.trim()) {
        e["deliveryAddress.city"] = "City is required";
      }
      if (!form.deliveryAddress.postalCode.trim()) {
        e["deliveryAddress.postalCode"] = "Postal code is required";
      }
    }

    if (settings?.minimumOrder && subtotal < settings.minimumOrder) {
      e.minimumOrder = `Minimum order amount is ${formatCurrency(settings.minimumOrder)}`;
    }

    if (form.paymentMethod === "CASH_ON_DELIVERY" && form.orderType !== "DELIVERY") {
      e.paymentMethod = "Cash on Delivery is only available for delivery orders";
    }
    if (form.paymentMethod === "CASH_AT_PICKUP" && form.orderType !== "PICKUP") {
      e.paymentMethod = "Cash at Pickup is only available for pickup orders";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        orderType: form.orderType,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        deliveryAddress:
          form.orderType === "DELIVERY"
            ? {
                street: form.deliveryAddress.street.trim(),
                city: form.deliveryAddress.city.trim(),
                state: form.deliveryAddress.state.trim() || undefined,
                postalCode: form.deliveryAddress.postalCode.trim(),
                deliveryInstructions:
                  form.deliveryAddress.deliveryInstructions.trim() || undefined,
              }
            : undefined,
        scheduledTime: form.scheduledTime || undefined,
        isGift: form.isGift,
        giftMessage: form.isGift ? form.giftMessage.trim() || undefined : undefined,
        specialInstructions: form.specialInstructions.trim() || undefined,
        paymentMethod: form.paymentMethod,
        promoCode: promoCode || undefined,
        tip: tipAmount,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          customizations: item.customizations,
          specialInstructions: item.specialInstructions || undefined,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Failed to place order");
        return;
      }

      const order = data.data;

      if (form.paymentMethod === "CARD") {
        router.push(`/checkout/pay?orderId=${order.id}`);
        return;
      }

      clearCart();
      router.push(`/order/${order.id}/confirmation`);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasMounted || items.length === 0) {
    return null;
  }

  return (
    <div className="artisan-checkout mx-auto max-w-7xl px-4 py-8 pb-[36rem] sm:px-6 lg:px-8 lg:pb-8">
      <div className="border-b border-latik/14 pb-6">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.26em] text-pulot">
          Final Step
        </p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black text-kape">Checkout</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-latik/76">
              Complete your order details below.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-latik/60">
            <span>
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
            <span className="h-px w-8 bg-latik/18" />
            <span>{form.orderType === "DELIVERY" ? "Delivery" : "Pickup"}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <Section first title="Order Type" icon={<Truck className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <OrderTypeButton
                active={form.orderType === "DELIVERY"}
                icon={<Truck className="h-5 w-5" />}
                label="Delivery"
                description="We'll deliver to your address"
                onClick={() => {
                  updateField("orderType", "DELIVERY");
                  if (form.paymentMethod === "CASH_AT_PICKUP") {
                    updateField("paymentMethod", "CARD");
                  }
                }}
              />
              <OrderTypeButton
                active={form.orderType === "PICKUP"}
                icon={<Store className="h-5 w-5" />}
                label="Pickup"
                description="Pick up at our store"
                onClick={() => {
                  updateField("orderType", "PICKUP");
                  if (form.paymentMethod === "CASH_ON_DELIVERY") {
                    updateField("paymentMethod", "CARD");
                  }
                }}
              />
            </div>
          </Section>

          <Section title="Contact Information" icon={<MapPin className="h-5 w-5" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Full Name"
                value={form.customerName}
                onChange={(v) => updateField("customerName", v)}
                error={errors.customerName}
                required
              />
              <FormField
                label="Email"
                type="email"
                value={form.customerEmail}
                onChange={(v) => updateField("customerEmail", v)}
                error={errors.customerEmail}
                required
              />
              <FormField
                label="Phone Number"
                type="tel"
                value={form.customerPhone}
                onChange={(v) => updateField("customerPhone", v)}
                error={errors.customerPhone}
                placeholder="+63 9XX XXX XXXX"
                className="sm:col-span-2"
                required
              />
            </div>
          </Section>

          {form.orderType === "DELIVERY" && (
            <Section title="Delivery Address" icon={<MapPin className="h-5 w-5" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Street Address"
                  value={form.deliveryAddress.street}
                  onChange={(v) => updateAddress("street", v)}
                  error={errors["deliveryAddress.street"]}
                  className="sm:col-span-2"
                  required
                />
                <FormField
                  label="City"
                  value={form.deliveryAddress.city}
                  onChange={(v) => updateAddress("city", v)}
                  error={errors["deliveryAddress.city"]}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="State/Province"
                    value={form.deliveryAddress.state}
                    onChange={(v) => updateAddress("state", v)}
                  />
                  <FormField
                    label="Postal Code"
                    value={form.deliveryAddress.postalCode}
                    onChange={(v) => updateAddress("postalCode", v)}
                    error={errors["deliveryAddress.postalCode"]}
                    required
                  />
                </div>
                <FormField
                  label="Delivery Instructions"
                  value={form.deliveryAddress.deliveryInstructions}
                  onChange={(v) => updateAddress("deliveryInstructions", v)}
                  placeholder="Gate code, landmark, etc."
                  className="sm:col-span-2"
                  textarea
                />
              </div>
            </Section>
          )}

          <Section title="Order Timing" icon={<Clock className="h-5 w-5" />}>
            <div className="divide-y divide-latik/12 border-y border-latik/12">
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 py-4 transition-colors",
                  !form.scheduledTime ? "text-kape" : "text-stone-700"
                )}
              >
                <input
                  type="radio"
                  name="timing"
                  checked={!form.scheduledTime}
                  onChange={() => updateField("scheduledTime", "")}
                  className="h-4 w-4 text-brown-600 focus:ring-brown-500"
                />
                <div>
                  <p className="text-sm font-medium text-stone-900">ASAP</p>
                  <p className="text-xs text-stone-500">As soon as possible</p>
                </div>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 py-4 transition-colors",
                  form.scheduledTime ? "text-kape" : "text-stone-700"
                )}
              >
                <input
                  type="radio"
                  name="timing"
                  checked={!!form.scheduledTime}
                  onChange={() => updateField("scheduledTime", getDefaultScheduleTime())}
                  className="mt-0.5 h-4 w-4 text-brown-600 focus:ring-brown-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">Schedule for later</p>
                  {form.scheduledTime && (
                    <input
                      type="datetime-local"
                      value={form.scheduledTime}
                      min={getMinScheduleTime()}
                      onChange={(e) => updateField("scheduledTime", e.target.value)}
                      className="mt-3 w-full rounded-xl border border-latik/16 bg-white/70 px-3 py-2 text-sm focus:border-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500/20"
                    />
                  )}
                </div>
              </label>
            </div>
          </Section>

          <Section title="Gift Options" icon={<Gift className="h-5 w-5" />}>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isGift}
                onChange={(e) => updateField("isGift", e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-brown-600 focus:ring-brown-500"
              />
              <span className="text-sm font-medium text-stone-700">This is a gift</span>
            </label>
            {form.isGift && (
              <div className="mt-4 border-t border-latik/12 pt-4">
                <FormField
                  label="Gift Message"
                  value={form.giftMessage}
                  onChange={(v) => updateField("giftMessage", v)}
                  placeholder="Write a special message for the recipient..."
                  textarea
                />
              </div>
            )}
          </Section>

          <Section title="Special Instructions">
            <FormField
              value={form.specialInstructions}
              onChange={(v) => updateField("specialInstructions", v)}
              placeholder="Any special requests or notes for your order..."
              textarea
            />
          </Section>

          <Section title="Payment Method" icon={<Smartphone className="h-5 w-5" />}>
            <div className="divide-y divide-latik/12 border-y border-latik/12">
              <PaymentOption
                active={form.paymentMethod === "CARD"}
                icon={<Smartphone className="h-5 w-5" />}
                label="GCash"
                description="Complete your payment securely online"
                onClick={() => updateField("paymentMethod", "CARD")}
              />
              {form.orderType === "DELIVERY" && (
                <PaymentOption
                  active={form.paymentMethod === "CASH_ON_DELIVERY"}
                  icon={<Banknote className="h-5 w-5" />}
                  label="Cash on Delivery"
                  description="Pay when your order arrives"
                  onClick={() => updateField("paymentMethod", "CASH_ON_DELIVERY")}
                />
              )}
              {form.orderType === "PICKUP" && (
                <PaymentOption
                  active={form.paymentMethod === "CASH_AT_PICKUP"}
                  icon={<Banknote className="h-5 w-5" />}
                  label="Cash at Pickup"
                  description="Pay when you pick up your order"
                  onClick={() => updateField("paymentMethod", "CASH_AT_PICKUP")}
                />
              )}
            </div>
            {errors.paymentMethod && (
              <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
            )}
          </Section>

          <Section title="Add a Tip">
            <div className="flex flex-wrap gap-2">
              {TIP_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    updateField("tip", preset);
                    setCustomTip("");
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    form.tip === preset && !customTip
                      ? "border-brown-500 bg-brown-50 text-brown-700"
                      : "border-latik/14 bg-white/60 text-stone-600 hover:border-latik/24"
                  )}
                >
                  {preset === 0 ? "No Tip" : formatCurrency(preset)}
                </button>
              ))}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                  PHP
                </span>
                <input
                  type="number"
                  value={customTip}
                  onChange={(e) => {
                    setCustomTip(e.target.value);
                    const val = parseFloat(e.target.value) || 0;
                    updateField("tip", Math.max(0, val));
                  }}
                  placeholder="Custom"
                  className="h-10 w-32 rounded-full border border-latik/14 bg-white/60 pl-11 pr-3 text-sm focus:border-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500/20"
                  min="0"
                />
              </div>
            </div>
          </Section>
        </div>

        <aside className="mt-10 hidden border-t border-latik/12 pt-8 lg:sticky lg:top-24 lg:mt-0 lg:block lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <SummaryPanel
            items={items}
            promoCode={promoCode}
            promoDiscount={promoDiscount}
            orderType={form.orderType}
            deliveryFee={deliveryFee}
            freeDeliveryThreshold={settings?.freeDeliveryThreshold}
            taxRate={taxRate}
            taxAmount={taxAmount}
            tipAmount={tipAmount}
            total={total}
            minimumOrderError={errors.minimumOrder}
            submitError={submitError}
            isAcceptingOrders={settings?.isAcceptingOrders ?? true}
            paymentMethod={form.paymentMethod}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-10 lg:hidden">
        <div className="mx-auto max-w-md overflow-hidden rounded-t-[1.6rem] border border-latik/14 bg-asukal/97 shadow-[0_-20px_36px_rgba(59,31,14,0.16)] backdrop-blur-sm">
          <div className="max-h-[78vh] overflow-y-auto px-4 pb-4 pt-4">
            <SummaryPanel
              items={items}
              promoCode={promoCode}
              promoDiscount={promoDiscount}
              orderType={form.orderType}
              deliveryFee={deliveryFee}
              freeDeliveryThreshold={settings?.freeDeliveryThreshold}
              taxRate={taxRate}
              taxAmount={taxAmount}
              tipAmount={tipAmount}
              total={total}
              minimumOrderError={errors.minimumOrder}
              submitError={submitError}
              isAcceptingOrders={settings?.isAcceptingOrders ?? true}
              paymentMethod={form.paymentMethod}
              submitting={submitting}
              onSubmit={handleSubmit}
              mobile
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  first = false,
  title,
  icon,
  children,
}: {
  first?: boolean;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("border-t border-latik/12 py-7", first && "border-t-0 pt-0")}>
      <div className="mb-5 flex items-center gap-3">
        {icon && <span className="text-brown-600">{icon}</span>}
        <h2 className="text-lg font-bold text-stone-900">{title}</h2>
        <div className="h-px flex-1 bg-latik/12" />
      </div>
      {children}
    </section>
  );
}

function OrderTypeButton({
  active,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[120px] flex-col items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
        active
          ? "border-brown-500 bg-brown-50 text-brown-700"
          : "border-latik/14 bg-white/55 text-stone-600 hover:border-latik/24 hover:bg-white/70"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border",
          active
            ? "border-brown-200 bg-brown-100 text-brown-700"
            : "border-latik/12 bg-white text-stone-500"
        )}
      >
        {icon}
      </span>
      <div className="space-y-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs opacity-75">{description}</span>
      </div>
    </button>
  );
}

function PaymentOption({
  active,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 py-4 text-left transition-colors",
        active ? "text-brown-700" : "text-stone-700 hover:text-stone-900"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border",
          active
            ? "border-brown-200 bg-brown-100 text-brown-700"
            : "border-latik/12 bg-white text-stone-500"
        )}
      >
        {icon}
      </span>
      <div>
        <p className={cn("text-sm font-semibold", active ? "text-brown-700" : "text-stone-900")}>
          {label}
        </p>
        <p className="text-xs text-stone-500">{description}</p>
      </div>
      <div className="ml-auto">
        <div
          className={cn(
            "h-5 w-5 rounded-full border-2",
            active ? "border-brown-500 bg-brown-500" : "border-stone-300"
          )}
        >
          {active && (
            <svg viewBox="0 0 20 20" fill="white" className="h-full w-full p-0.5">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function FormField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required,
  className,
  textarea,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  textarea?: boolean;
}) {
  const inputId = useId();
  const inputClass = cn(
    "w-full rounded-xl border bg-white/70 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brown-500/20",
    error ? "border-red-500 focus:border-red-500" : "border-latik/16 focus:border-brown-500"
  );

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-stone-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {textarea ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(inputClass, "min-h-[80px]")}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(inputClass, "h-10")}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function OrderSummaryItem({ item }: { item: CartItem }) {
  const customizations: string[] = [];
  if (item.customizations.size) customizations.push(item.customizations.size);
  if (item.customizations.addOns?.length) {
    customizations.push(...item.customizations.addOns.map((a) => a.name));
  }

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-900">
          {item.quantity}x {item.name}
        </p>
        {customizations.length > 0 && (
          <p className="truncate text-xs text-stone-500">{customizations.join(", ")}</p>
        )}
      </div>
      <p className="shrink-0 text-sm font-medium text-stone-700">
        {formatCurrency(item.lineTotal)}
      </p>
    </div>
  );
}

function SummaryPanel({
  items,
  promoCode,
  promoDiscount,
  orderType,
  deliveryFee,
  freeDeliveryThreshold,
  taxRate,
  taxAmount,
  tipAmount,
  total,
  minimumOrderError,
  submitError,
  isAcceptingOrders,
  paymentMethod,
  submitting,
  onSubmit,
  mobile = false,
}: {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
  orderType: "DELIVERY" | "PICKUP";
  deliveryFee: number;
  freeDeliveryThreshold?: number | null;
  taxRate: number;
  taxAmount: number;
  tipAmount: number;
  total: number;
  minimumOrderError?: string;
  submitError: string;
  isAcceptingOrders: boolean;
  paymentMethod: CheckoutForm["paymentMethod"];
  submitting: boolean;
  onSubmit: () => void;
  mobile?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-5 w-5 text-brown-600" />
        <h2 className="text-lg font-bold text-stone-900">Order Summary</h2>
        <div className="h-px flex-1 bg-latik/12" />
      </div>

      <div
        className={cn(
          "mt-5 divide-y divide-latik/10 overflow-y-auto border-y border-latik/10",
          mobile ? "max-h-64" : "max-h-72"
        )}
      >
        {items.map((item) => (
          <OrderSummaryItem key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <PriceLine label="Subtotal" amount={items.reduce((sum, item) => sum + item.lineTotal, 0)} />
        {promoDiscount > 0 && (
          <PriceLine
            label={`Promo (${promoCode})`}
            amount={-promoDiscount}
            className="text-green-600"
          />
        )}
        {orderType === "DELIVERY" && (
          <PriceLine
            label="Delivery Fee"
            amount={deliveryFee}
            note={deliveryFee === 0 && freeDeliveryThreshold ? "Free!" : undefined}
          />
        )}
        {taxAmount > 0 && <PriceLine label={`Tax (${taxRate}%)`} amount={taxAmount} />}
        {tipAmount > 0 && <PriceLine label="Tip" amount={tipAmount} />}
        <div className="flex justify-between border-t border-latik/12 pt-3 text-base font-bold text-stone-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {minimumOrderError && <InlineAlert tone="error">{minimumOrderError}</InlineAlert>}

      {submitError && <InlineAlert tone="error">{submitError}</InlineAlert>}

      {!isAcceptingOrders && (
        <InlineAlert tone="warning">
          We&apos;re not accepting orders right now. Please try again later.
        </InlineAlert>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !isAcceptingOrders}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brown-600 py-3.5 font-semibold text-white transition-colors hover:bg-brown-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Place Order
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-stone-400">
        {paymentMethod === "CARD"
          ? "You'll be redirected to complete your GCash payment"
          : "Your order will be confirmed shortly"}
      </p>
    </div>
  );
}

function PriceLine({
  label,
  amount,
  note,
  className,
}: {
  label: string;
  amount: number;
  note?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between text-stone-600", className)}>
      <span>{label}</span>
      <span>{note ? <span className="font-medium text-green-600">{note}</span> : formatCurrency(amount)}</span>
    </div>
  );
}

function InlineAlert({
  tone,
  children,
}: {
  tone: "error" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-4 flex items-start gap-2 border-l-2 px-4 py-3 text-sm",
        tone === "error"
          ? "border-red-300 bg-red-50/80 text-red-700"
          : "border-amber-300 bg-amber-50/80 text-amber-700"
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function getDefaultScheduleTime(): string {
  const d = new Date();
  d.setHours(d.getHours() + 2);
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function getMinScheduleTime(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
}
