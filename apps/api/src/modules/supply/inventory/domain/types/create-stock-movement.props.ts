import { StockMovementDirection, StockMovementType } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface CreateStockMovementProps {
  id: string;
  productId: string;
  clinicId: string;
  batchId?: string | null;
  type: StockMovementType;
  direction: StockMovementDirection;
  quantity: Prisma.Decimal;
  unitPrice?: Prisma.Decimal | null;
  currency?: string;
  vatRate?: Prisma.Decimal | null;
  vatAmount?: Prisma.Decimal | null;
  totalAmount?: Prisma.Decimal | null;
  performedById?: string | null;
  notes?: string | null;
}
