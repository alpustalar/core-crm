import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { IyzicoTransactionStatusSchema } from '../inputTypeSchemas/IyzicoTransactionStatusSchema'

/////////////////////////////////////////
// IYZICO TRANSACTION SCHEMA
/////////////////////////////////////////

export const IyzicoTransactionSchema = z.object({
  status: IyzicoTransactionStatusSchema,
  id: z.uuid(),
  paymentId: z.string(),
  conversationId: z.string(),
  token: z.string().nullable(),
  iyzicoPaymentId: z.string().nullable(),
  iyzicoPaymentTransactionId: z.string().nullable(),
  rawResponse: JsonValueSchema.nullable(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type IyzicoTransaction = z.infer<typeof IyzicoTransactionSchema>

export default IyzicoTransactionSchema;
