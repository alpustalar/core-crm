import { StockMovementDirectionType as StockMovementDirection } from '@input-type-schemas/StockMovementDirectionSchema';
import { StockMovementTypeType as StockMovementType } from '@input-type-schemas/StockMovementTypeSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { Decimal } from 'decimal.js';

export interface CreateStockMovementProps {
  id?: string;
  productId: string;
  clinicId: string;
  batchId?: string | null;
  type: StockMovementType;
  direction: StockMovementDirection;
  financeLedgerId?: string | null;
  quantity: Decimal | number;
  unitPrice?: Money | null;
  vatRate?: number | string | null;
  performedById?: string | null;
  notes?: string | null;
}
