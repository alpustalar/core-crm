import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { IyzicoTransactionStatusSchema } from '../inputTypeSchemas/IyzicoTransactionStatusSchema'

/////////////////////////////////////////
// IYZICO TRANSACTION SCHEMA
/////////////////////////////////////////

export const IyzicoTransactionSchema = z.object({
  status: IyzicoTransactionStatusSchema,
  id: z.string(),
  installmentId: z.string(),
  conversationId: z.string(),
  iyzicoPaymentId: z.string().nullable(),
  iyzicoPaymentTransactionId: z.string().nullable(),
  token: z.string().nullable(),
  rawResponse: JsonValueSchema.nullable(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type IyzicoTransaction = z.infer<typeof IyzicoTransactionSchema>

export default IyzicoTransactionSchema;
