import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { PaymentMethodSchema } from '../inputTypeSchemas/PaymentMethodSchema'
import { PaymentStatusSchema } from '../inputTypeSchemas/PaymentStatusSchema'

/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////

export const PaymentSchema = z.object({
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  id: z.uuid(),
  clinicId: z.string(),
  patientId: z.string(),
  appointmentId: z.string().nullable(),
  expectedAmount: z.instanceof(Prisma.Decimal, { message: "Field 'expectedAmount' must be a Decimal. Location: ['Models', 'Payment']"}),
  currency: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Payment = z.infer<typeof PaymentSchema>

export default PaymentSchema;
