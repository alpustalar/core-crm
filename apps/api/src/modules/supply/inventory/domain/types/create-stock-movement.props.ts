import { StockMovementDirection, StockMovementType } from '@prisma/client';

export interface CreateStockMovementProps {
  productId: string;
  clinicId: string;
  batchId?: string | null;
  type: StockMovementType;
  direction: StockMovementDirection;
  financeLedgerId?: string | null;
  quantity: number | string;
  unitPrice?: number | string | null;
  currency?: string;
  vatRate?: number | string | null;
  performedById?: string | null;
  notes?: string | null;
}
