import {
  Prisma,
  StockMovementDirection,
  StockMovementType,
} from '@prisma/client';

export interface CreateStockMovementProps {
  productId: string;
  clinicId: string;
  batchId?: string | null;
  type: StockMovementType;
  direction: StockMovementDirection;
  financeLedgerId?: string | null;
  quantity: Prisma.Decimal;
  unitPrice?: Prisma.Decimal | null;
  currency?: string;
  vatRate?: Prisma.Decimal | null;
  vatAmount?: Prisma.Decimal | null;
  totalAmount?: Prisma.Decimal | null;
  performedById?: string | null;
  notes?: string | null;
}
