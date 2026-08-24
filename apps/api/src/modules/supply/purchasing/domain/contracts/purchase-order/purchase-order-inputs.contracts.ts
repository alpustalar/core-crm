import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/** Props for a single purchase order item. */
export interface PurchaseOrderItemInput {
  /** Product ID (optional, can be free-text description). */
  productId?: string | null;
  /** Item description (required). */
  description: string;
  /** Quantity ordered. */
  quantity: number;
  /** Unit price. */
  unitPrice: number;
  /** VAT rate (0-100). */
  vatRate?: number;
}

/** Props for receiving a purchase order item. */
export interface ReceivePurchaseOrderItemInput {
  /** Order item ID (required). */
  itemId: string;
  /** Quantity received. */
  quantity: number;
  /** Batch lot number. */
  lotNumber?: string | null;
  /** Batch expiration date. */
  expiresAt?: Date | null;
}

/** Props for creating a new purchase order. */
export interface CreatePurchaseOrderProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  /** Clinic ID (required). */
  clinicId: string;
  /** Organization ID (required). */
  organizationId: string;
  /** Supplier ID (required). */
  supplierId: string;
  /** Purchase request ID (if this order is based on a request). */
  purchaseRequestId?: string | null;
  /** Order date. */
  orderDate?: Date;
  /** Expected delivery date. */
  expectedDate?: Date | null;
  /** Currency code. */
  currency?: CurrencyType;
  /** Optional note. */
  note?: string | null;
  /** Order items (min 1). */
  items: PurchaseOrderItemInput[];
}
