import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { StockMovementDirectionSchema, StockMovementTypeSchema } from '@shared';
import { Money } from '@src/domain/value-objects/money.vo';

export const CreateStockMovementSchema = z.object({
  id: z.uuid().optional(),
  productId: z.uuid(),
  clinicId: z.uuid(),
  batchId: z.uuid().nullable().optional(),

  type: StockMovementTypeSchema,
  direction: StockMovementDirectionSchema,

  quantity: z.custom<number | Decimal>(),

  unitPrice: z
    .custom<Money>((val) => val instanceof Money)
    .nullable()
    .optional(),

  vatRate: z.number().nullable().optional(),

  financeLedgerId: z.uuid().nullable().optional(),
  performedById: z.uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateStockMovementProps = z.infer<
  typeof CreateStockMovementSchema
>;
export const StockLevelSchema = z.object({
  productId: z.uuid(),
  productName: z.string(),
  stockCode: z.string(),
  clinicId: z.uuid(),
  totalQuantity: z.string(),
  criticalStockQty: z.string(),
  isBelowCritical: z.boolean(),
});
export type StockLevel = z.infer<typeof StockLevelSchema>;
