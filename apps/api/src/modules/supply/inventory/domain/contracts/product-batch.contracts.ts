import { StockPurchasedEventPayload } from '@modules/supply/inventory/domain/events';
import { z } from 'zod';
import { Quantity } from '@src/domain/value-objects/quantity.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { StockMovementTypeSchema } from '@shared';
import { Decimal } from 'decimal.js';

export const CreateBatchFromPurchaseSchema = z.object({
  id: z.uuid().optional(),
  productId: z.uuid(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  supplierId: z.uuid().nullable(),
  lotNumber: z.string().nullable(),
  expiresAt: z.date().nullable(),

  quantity: z.custom<Quantity>((val) => val instanceof Quantity),
  purchasePrice: z.custom<Money>((val) => val instanceof Money),

  notes: z.string().nullable(),

  eventPayload:
    z.custom<
      Omit<
        StockPurchasedEventPayload,
        | 'batchId'
        | 'quantity'
        | 'unitPrice'
        | 'totalAmount'
        | 'productId'
        | 'clinicId'
        | 'organizationId'
        | 'supplierId'
      >
    >(),
});

export type CreateBatchFromPurchaseProps = z.infer<
  typeof CreateBatchFromPurchaseSchema
>;

export const DeductQuantitySchema = z.object({
  qty: z.custom<Decimal | Quantity>(
    (val) => val instanceof Decimal || val instanceof Quantity
  ),
  performedById: z.uuid(),
  notes: z.string().nullable().optional(),
  movementType: StockMovementTypeSchema.optional(),
});

export type DeductQuantityProps = z.infer<typeof DeductQuantitySchema>;
export type AddQuantityProps = DeductQuantityProps;
