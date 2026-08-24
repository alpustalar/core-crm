import { Quantity } from '@src/domain/value-objects/quantity.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { Decimal } from 'decimal.js';
import type { StockPurchasedEventPayload } from '@modules/supply/inventory/domain/events';
import { StockMovementTypeType } from '@input-type-schemas/StockMovementTypeSchema';
import { StockMovementDirectionType } from '@input-type-schemas/StockMovementDirectionSchema';

/** Props for creating a batch from purchase. */
export interface CreateBatchFromPurchaseProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  /** Product ID (required). */
  productId: string;
  /** Clinic ID (required). */
  clinicId: string;
  /** Organization ID (required). */
  organizationId: string;
  /** Supplier ID. */
  supplierId?: string | null;
  /** Batch lot number for traceability. */
  lotNumber?: string | null;
  /** Expiration date. */
  expiresAt?: Date | null;
  /** Quantity in batch — Quantity VO. */
  quantity: Quantity;
  /** Purchase price per unit — Money VO. */
  purchasePrice: Money;
  /** Optional notes. */
  notes?: string | null;
  /** Event payload for stock-purchased event. */
  eventPayload: Omit<
    StockPurchasedEventPayload,
    | 'batchId'
    | 'productId'
    | 'clinicId'
    | 'organizationId'
    | 'quantity'
    | 'unitPrice'
    | 'totalAmount'
    | 'supplierId'
  >;
}

/** Props for deducting quantity from batch. */
export interface DeductQuantityProps {
  /** Quantity to deduct — Decimal or Quantity VO. */
  qty: Decimal | Quantity;
  /** User ID performing deduction. */
  performedById: string;
  /** Optional audit note. */
  notes?: string | null;
  /** Type of stock movement. */
  movementType?: StockMovementTypeType;
  /** Movement record ID (auto-generated if omitted). */
  movementId?: string;
}

/** Props for adding quantity to batch (same shape as DeductQuantityProps). */
export type AddQuantityProps = DeductQuantityProps;

/** Props for raising a stock quantity changed event. */
export interface RaiseStockQuantityChangedProps {
  /** Movement record ID (auto-generated if omitted). */
  movementId?: string;
  /** Direction of movement (IN or OUT). */
  direction: StockMovementDirectionType;
  /** Type of movement. */
  movementType: StockMovementTypeType;
  /** Quantity changed — Quantity VO. */
  quantity: Quantity;
  /** User ID performing change. */
  performedById: string;
  /** Optional audit note. */
  notes?: string | null;
}
