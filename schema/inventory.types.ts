/**
 * Canonical Inventory Data Contracts for The Laddu Story OMS
 */

export type ProductCategory = 
  | 'TRADITIONAL'
  | 'PREMIUM'
  | 'SUGAR_FREE'
  | 'FESTIVE_HAMPERS'
  | 'BOX_SAMPLERS';

export type ReorderStatus = 'HEALTHY' | 'REORDER_NOW';

export interface InventoryItem {
  sku: string; // e.g. MOTI-500G, BESAN-1KG
  productName: string;
  category: ProductCategory;
  unitPrice: number; // Selling price in INR
  initialStock: number; // Opening batch stock
  unitsSold: number; // Derived dynamically via SUMIF
  currentStock: number; // initialStock - unitsSold
  minThreshold: number; // Minimum safe reserve
  reorderStatus: ReorderStatus;
  shelfLifeDays?: number;
  ingredientsList?: string[];
}
