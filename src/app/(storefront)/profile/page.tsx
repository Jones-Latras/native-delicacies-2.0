"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validators";
import { Button, Input, Card, CardHeader, CardContent } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import {
  User,
  MapPin,
  ShoppingBag,
  Lock,
  Trash2,
  Plus,
  Star,
  LogOut,
} from "lucide-react";

type TabId = "profile" | "addresses" | "orders" | "password";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  addresses: Address[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/profile");
    return null;
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "password", label: "Password", icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Account</h1>
          <p className="text-stone-500">Manage your profile, addresses, and orders</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-stone-500"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-stone-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-white text-amber-800 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "addresses" && <AddressesTab />}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "password" && <PasswordTab />}
    </div>
  );
}

// ── Profile Tab ──

function ProfileTab() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setProfile(json.data);
          reset({ name: json.data.name, phone: json.data.phone ?? "" });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(data: ProfileUpdateInput) {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setProfile((p) => (p ? { ...p, ...json.data } : p));
      reset(data);
      toast("Profile updated", "success");
    } else {
      toast(json.error ?? "Update failed", "error");
    }
  }

  if (loading) return <ProfileSkeleton />;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-stone-900">Personal Information</h2>
        <p className="text-sm text-stone-500">Update your personal details</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Full Name"
            error={errors.name?.message}
            {...register("name")}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
            <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
              {profile?.email}
            </p>
            <p className="mt-1 text-xs text-stone-400">Email cannot be changed</p>
          </div>
          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-stone-100" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Addresses Tab ──

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadAddresses = useCallback(() => {
    fetch("/api/user/addresses")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAddresses(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAddresses((a) => a.filter((addr) => addr.id !== id));
      toast("Address deleted", "success");
    }
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/user/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) loadAddresses();
  }

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">Saved Addresses</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Add Address
        </Button>
      </div>

      {showForm && (
        <AddressForm
          onSaved={() => {
            setShowForm(false);
            loadAddresses();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {addresses.length === 0 && !showForm ? (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-stone-500">
              No saved addresses yet. Add one for faster checkout.
            </p>
          </CardContent>
        </Card>
      ) : (
        addresses.map((addr) => (
          <Card key={addr.id}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900">{addr.label}</p>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        <Star className="h-3 w-3" /> Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone-600">
                    {addr.street}, {addr.city}
                    {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}
                  </p>
                  {addr.deliveryInstructions && (
                    <p className="mt-1 text-xs text-stone-400">
                      Note: {addr.deliveryInstructions}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(addr.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function AddressForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      label: "Home",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      deliveryInstructions: "",
      isDefault: false,
    },
  });

  async function onSubmit(data: Record<string, unknown>) {
    const res = await fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast("Address added", "success");
      onSaved();
    } else {
      toast("Failed to add address", "error");
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input id="label" label="Label" placeholder="Home / Office" {...register("label")} />
            <Input id="postalCode" label="Postal Code" {...register("postalCode")} />
          </div>
          <Input id="street" label="Street Address" {...register("street")} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="city" label="City" {...register("city")} />
            <Input id="state" label="State/Province" {...register("state")} />
          </div>
          <Input
            id="deliveryInstructions"
            label="Delivery Instructions (optional)"
            placeholder="Gate code, landmarks, etc."
            {...register("deliveryInstructions")}
          />
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" {...register("isDefault")} className="rounded border-stone-300" />
            Set as default address
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Address
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Orders Tab ──

interface OrderItemSummary {
  id: string;
  menuItemName: string;
  menuItemImage: string | null;
  menuItemSlug: string;
  quantity: number;
  priceAtOrder: number;
}

interface UserOrder {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItemSummary[];
}

function OrdersTab() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/orders")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ProfileSkeleton />;

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-stone-300" />
            <h3 className="mt-4 font-medium text-stone-900">No orders yet</h3>
            <p className="mt-1 text-sm text-stone-500">
              Your order history will appear here after your first order.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColor: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-amber-100 text-amber-800",
    PREPARING: "bg-orange-100 text-orange-800",
    READY: "bg-green-100 text-green-800",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent>
            <div
              className="flex cursor-pointer items-center justify-between"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            >
              <div>
                <p className="font-medium text-stone-900">Order #{order.orderNumber}</p>
                <p className="text-sm text-stone-500">
                  {new Date(order.createdAt).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-stone-900">
                  ₱{order.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColor[order.status] ?? "bg-stone-100 text-stone-700"
                  }`}
                >
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === order.id && (
              <div className="mt-4 border-t border-stone-100 pt-4">
                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-stone-700">
                        {item.quantity}x {item.menuItemName}
                      </span>
                      <span className="text-stone-600">
                        ₱{(item.priceAtOrder * item.quantity).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`/track/${order.orderNumber}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200"
                  >
                    Track Order
                  </a>
                  {order.status === "COMPLETED" && (
                    <a
                      href={`/order/${order.id}/confirmation`}
                      className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200"
                    >
                      View Receipt
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Password Tab ──

function PasswordTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(data: Record<string, string>) {
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      toast("Password updated", "success");
      reset();
    } else {
      toast(json.error ?? "Failed to change password", "error");
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-stone-900">Change Password</h2>
        <p className="text-sm text-stone-500">Update your password to keep your account secure</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="currentPassword"
            label="Current Password"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword", { required: "Current password is required" })}
            error={errors.currentPassword?.message}
          />
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            autoComplete="new-password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "At least 8 characters" },
            })}
            error={errors.newPassword?.message}
          />
          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword", { required: "Please confirm your password" })}
            error={errors.confirmPassword?.message}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isSubmitting}>
              Update Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
