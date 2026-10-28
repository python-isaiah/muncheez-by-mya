export type ActiveView = "shop" | "track" | "policies" | "admin";

export type FulfillmentType = "pickup" | "delivery" | "shipping";

export type PaymentMethod = "Cash App" | "Zelle";

export type OrderStatus =
  | "payment_pending"
  | "payment_received"
  | "baking"
  | "confirmed_24h"
  | "ready_or_shipped"
  | "grace_period_missed"
  | "cancelled_no_refund";

export interface CookieFlavor {
  id: string;
  name: string;
  price: number;
  tag: string;
  bg: string;
  accent: string;
  emoji: string;
  image: string;
  desc: string;
  inStock: boolean;
}

export interface OrderItem {
  name: string;
  qty: number;
  boxNumber?: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  fulfillment: FulfillmentType;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  trackingNumber: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  emailDispatched?: boolean;
}

export interface OrderStatusMeta {
  label: string;
  badge: string;
  step: number;
  desc: string;
}

export interface StoreConfig {
  bakerEmail: string;
  cashAppTag: string;
  zelleContact: string;
  pickupArea: string;
  shippingFee: number;
  deliveryFee: number;
}

export interface CheckoutFormState {
  customerName: string;
  phone: string;
  email: string;
  fulfillment: FulfillmentType;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  paymentMethod: PaymentMethod;
  agree24hrPayment: boolean;
  agree48hrLeadAndReschedule: boolean;
  agree15minGracePolicy: boolean;
}

export type BoxMap = Record<string, number>;
