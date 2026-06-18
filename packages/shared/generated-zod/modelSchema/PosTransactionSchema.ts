import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'
import { PosTransactionStatusSchema } from '../inputTypeSchemas/PosTransactionStatusSchema'

/////////////////////////////////////////
// POS TRANSACTION SCHEMA
/////////////////////////////////////////

export const PosTransactionSchema = z.object({
  currency: CurrencySchema,
  status: PosTransactionStatusSchema,
  id: z.uuid(),
  posDeviceId: z.string(),
  clinicId: z.string(),
  patientId: z.string().nullable(),
  appointmentId: z.string().nullable(),
  paymentId: z.string().nullable(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'PosTransaction']"}),
  externalRef: z.string().nullable(),
  rawRequest: JsonValueSchema.nullable(),
  rawResponse: JsonValueSchema.nullable(),
  initiatedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PosTransaction = z.infer<typeof PosTransactionSchema>

export default PosTransactionSchema;
