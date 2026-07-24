import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { CashMovementTypeSchema } from '../inputTypeSchemas/CashMovementTypeSchema'
import { CashMovementDirectionSchema } from '../inputTypeSchemas/CashMovementDirectionSchema'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'

/////////////////////////////////////////
// CASH MOVEMENT SCHEMA
/////////////////////////////////////////

export const CashMovementSchema = z.object({
  type: CashMovementTypeSchema,
  direction: CashMovementDirectionSchema,
  currency: CurrencySchema,
  id: z.string(),
  cashSessionId: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'CashMovement']"}),
  description: z.string().nullable(),
  referenceType: z.string().nullable(),
  referenceId: z.string().nullable(),
  performedById: z.string(),
  occurredAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type CashMovement = z.infer<typeof CashMovementSchema>

export default CashMovementSchema;
