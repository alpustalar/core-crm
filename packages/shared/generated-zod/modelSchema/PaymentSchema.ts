import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { PaymentStatusSchema } from '../inputTypeSchemas/PaymentStatusSchema'

/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////

export const PaymentSchema = z.object({
  status: PaymentStatusSchema,
  id: z.uuid(),
  clinicId: z.string(),
  patientId: z.string(),
  appointmentId: z.string().nullable(),
  providerId: z.string().nullable(),
  totalAmount: z.instanceof(Prisma.Decimal, { message: "Field 'totalAmount' must be a Decimal. Location: ['Models', 'Payment']"}),
  currency: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Payment = z.infer<typeof PaymentSchema>

export default PaymentSchema;
