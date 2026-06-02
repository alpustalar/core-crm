import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { PaymentMethodSchema } from '../inputTypeSchemas/PaymentMethodSchema'
import { InstallmentStatusSchema } from '../inputTypeSchemas/InstallmentStatusSchema'

/////////////////////////////////////////
// PAYMENT INSTALLMENT SCHEMA
/////////////////////////////////////////

export const PaymentInstallmentSchema = z.object({
  method: PaymentMethodSchema,
  status: InstallmentStatusSchema,
  id: z.uuid(),
  paymentId: z.string(),
  installmentNo: z.number().int(),
  amount: z.instanceof(Prisma.Decimal, { message: "Field 'amount' must be a Decimal. Location: ['Models', 'PaymentInstallment']"}),
  currency: z.string(),
  dueDate: z.coerce.date().nullable(),
  paidAt: z.coerce.date().nullable(),
  note: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PaymentInstallment = z.infer<typeof PaymentInstallmentSchema>

export default PaymentInstallmentSchema;
