/**
 * Canonical Customer CRM Data Contracts for The Laddu Story OMS
 */

import { OrderChannel } from './order.types';

export interface CustomerProfile {
  phoneNumber: string; // Primary Key
  customerName: string;
  primaryChannel: OrderChannel;
  totalOrders: number;
  lifetimeValue: number; // Cumulative spend in INR
  lastOrderDate: string; // ISO DateTime
  address?: string;
  pincode?: string;
  loyaltyTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'ROYAL';
}
