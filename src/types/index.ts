// ── Enums ──

export type UserRole = "CUSTOMER" | "ADMIN" | "MANAGER" | "STAFF";
export type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type OrderType = "DELIVERY" | "PICKUP";
export type PaymentMethod = "CARD" | "CASH_ON_DELIVERY" | "CASH_AT_PICKUP";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OriginRegion = "Luzon" | "Visayas" | "Mindanao";
export type DiscountType = "PERCENTAGE" | "FIXED";

// ── Cart ──

export interface CartItemCustomization {
  size?: string;
  sizePrice?: number;
  addOns?: { name: string; price: number }[];
  modifications?: string[];
}

export interface CartItem {
  id: string; // unique cart line id
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  customizations: CartItemCustomization;
  specialInstructions?: string;
  lineTotal: number;
}

// ── Menu ──

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isVisible: boolean;
  imageUrl?: string;
}

export interface MenuItemOption {
  id: string;
  optionGroup: string;
  name: string;
  priceModifier: number;
  isRequired: boolean;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: MenuCategory;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  originRegion?: OriginRegion;
  shelfLifeDays?: number;
  storageInstructions?: string;
  heritageStory?: string;
  dietaryTags: string[];
  preparationMinutes?: number;
  ingredients?: string;
  allergenInfo?: string;
  dailyLimit?: number | null;
  options: MenuItemOption[];
}

// ── Orders ──

export interface OrderItemData {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  priceAtOrder: number;
  customizations: CartItemCustomization;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: OrderType;
  status: OrderStatus;
  deliveryAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  pickupTime?: string;
  scheduledTime?: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  isGift: boolean;
  giftMessage?: string;
  specialInstructions?: string;
  createdAt: string;
  estimatedReadyTime?: string;
  items: OrderItemData[];
}

// ── Business Settings ──

export interface TimeSlot {
  open: string; // "HH:MM"
  close: string;
}

export interface DaySchedule {
  isClosed: boolean;
  slots: TimeSlot[];
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DeliveryZone {
  name: string;
  maxDistance: number; // km
  fee: number;
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  operatingHours: OperatingHours;
  deliveryZones: DeliveryZone[];
  deliveryFee: number;
  minimumOrder: number;
  freeDeliveryThreshold?: number;
  isAcceptingOrders: boolean;
  taxRate: number;
  timezone: string;
  heroImageUrl?: string;
  aboutText?: string;
}

// ── API ──

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
