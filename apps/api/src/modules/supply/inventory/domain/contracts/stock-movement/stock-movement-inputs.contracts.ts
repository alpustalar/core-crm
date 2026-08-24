import { Decimal } from 'decimal.js';
import { Money } from '@src/domain/value-objects/money.vo';
import { StockMovementTypeType } from '@input-type-schemas/StockMovementTypeSchema';
import { StockMovementDirectionType } from '@input-type-schemas/StockMovementDirectionSchema';

/** Props for creating a stock movement record. */
export interface CreateStockMovementProps {
  /** Optional UUID; auto-generated if omitted. */
  id?: string;
  /** Product ID (required). */
  productId: string;
  /** Clinic ID (required). */
  clinicId: string;
  /** Batch ID (optional). */
  batchId?: string | null;
  /** Type of movement (PURCHASE, CONSUMPTION, RETURN, etc.). */
  type: StockMovementTypeType;
  /** Direction (IN or OUT). */
  direction: StockMovementDirectionType;
  /** Quantity moved — number or Decimal. */
  quantity: number | Decimal;
  /** Unit price at movement time — Money VO. */
  unitPrice?: Money | null;
  /** VAT rate applied. */
  vatRate?: number | null;
  /** Finance ledger entry ID (if posted). */
  financeLedgerId?: string | null;
  /** User ID performing movement. */
  performedById?: string | null;
  /** Optional audit note. */
  notes?: string | null;
}
