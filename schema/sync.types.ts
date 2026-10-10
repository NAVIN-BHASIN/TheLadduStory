/**
 * Audit Logging & Offline-First Sync Data Contracts
 */

export type SyncSource = 'WEBHOOK_META' | 'ADMIN_DESKTOP' | 'MANUAL_SHEETS';

export type SyncAction = 
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'STOCK_DEDUCTED'
  | 'PAYMENT_VERIFIED'
  | 'FULL_RECONCILIATION';

export type SyncStatusState = 'SUCCESS' | 'FAILED' | 'RETRY' | 'PENDING';

export interface SyncLogItem {
  logId: string;
  timestamp: string;
  source: SyncSource;
  action: SyncAction;
  status: SyncStatusState;
  payloadSummary: string; // JSON summary
}

export interface OfflineSyncQueueItem {
  id: string;
  entityType: 'ORDER' | 'STOCK_ADJUSTMENT';
  action: 'INSERT' | 'UPDATE';
  data: any;
  createdAt: number; // timestamp ms
  retryCount: number;
}
