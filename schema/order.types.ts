/**
 * Canonical Order Data Contracts for The Laddu Story OMS
 */

export type OrderChannel = 'WALK_IN' | 'WHATSAPP' | 'INSTAGRAM';

export type PaymentMethod = 'UPI' | 'CASH' | 'CARD' | 'PENDING';

export type PaymentStatus = 'PAID' | 'UNPAID' | 'REFUNDED';

export type OrderStatus = 'RECEIVED' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  sku: string;
  productName: string;
  quantity: number;
  unitAmount: number; // in INR
  totalAmount: number; // in INR
}

export interface Order {
  orderId: string; // Format: TLS-YYYYMMDD-XXXX
  createdAt: string; // ISO 8601 String
  channel: OrderChannel;
  customerName: string;
  customerPhone: string; // E.164 format (+91...)
  sku: string; // Primary SKU or Comma-separated for bundles
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string; // Gifting notes, custom box selection
  syncedToSheets?: boolean;
}
