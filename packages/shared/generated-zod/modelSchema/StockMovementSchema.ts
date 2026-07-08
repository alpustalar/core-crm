import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { StockMovementTypeSchema } from '../inputTypeSchemas/StockMovementTypeSchema'
import { StockMovementDirectionSchema } from '../inputTypeSchemas/StockMovementDirectionSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// STOCK MOVEMENT SCHEMA
/////////////////////////////////////////

export const StockMovementSchema = z.object({
  type: StockMovementTypeSchema,
  direction: StockMovementDirectionSchema,
  currency: CurrencySchema,
  id: z.string(),
  productId: z.string(),
  clinicId: z.string(),
  batchId: z.string().nullable(),
  quantity: z.instanceof(Prisma.Decimal, { message: "Field 'quantity' must be a Decimal. Location: ['Models', 'StockMovement']"}),
  unitPrice: z.instanceof(Prisma.Decimal, { message: "Field 'unitPrice' must be a Decimal. Location: ['Models', 'StockMovement']"}).nullable(),
  vatRate: z.instanceof(Prisma.Decimal, { message: "Field 'vatRate' must be a Decimal. Location: ['Models', 'StockMovement']"}).nullable(),
  vatAmount: z.instanceof(Prisma.Decimal, { message: "Field 'vatAmount' must be a Decimal. Location: ['Models', 'StockMovement']"}).nullable(),
  totalAmount: z.instanceof(Prisma.Decimal, { message: "Field 'totalAmount' must be a Decimal. Location: ['Models', 'StockMovement']"}).nullable(),
  financeLedgerId: z.string().nullable(),
  performedById: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type StockMovement = z.infer<typeof StockMovementSchema>

export default StockMovementSchema;
