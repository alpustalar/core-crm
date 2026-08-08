import { z } from 'zod';
import { decimalSchema } from '../../common/decimal';
import { CurrencySchema } from '../inputTypeSchemas/CurrencySchema'
import { PaymentStatusSchema } from '../inputTypeSchemas/PaymentStatusSchema'

/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////

export const PaymentSchema = z.object({
  currency: CurrencySchema,
  status: PaymentStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  patientId: z.string(),
  appointmentId: z.string().nullable(),
  providerId: z.string().nullable(),
  totalAmount: decimalSchema("Field 'totalAmount' must be a Decimal. Location: ['Models', 'Payment']"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Payment = z.infer<typeof PaymentSchema>

export default PaymentSchema;
