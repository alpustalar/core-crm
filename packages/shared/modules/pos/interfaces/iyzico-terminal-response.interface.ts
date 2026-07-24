import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

// 1. Transaction Status Enum
export const IyzicoTerminalTransactionStatusSchema = z.enum(['SUCCESS', 'FAILED', 'PENDING']);

// 2. Transaction Response Schema
export const IyzicoTerminalTransactionResponseSchema = z.object({
  posTransactionId: z.string().min(1),
  status: IyzicoTerminalTransactionStatusSchema,
  approved: z.boolean().optional(),
  iyzicoPaymentId: z.string().optional(),
  authCode: z.string().optional(),
  hostReference: z.string().optional(),
  maskedCardNumber: z.string().optional(),
  cardType: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

// 3. EOD Status Enum
export const IyzicoTerminalEodStatusSchema = z.enum(['SUCCESS', 'FAILED']);

// 4. EOD Response Schema
export const IyzicoTerminalEodResponseSchema = z.object({
  status: IyzicoTerminalEodStatusSchema,
  batchNo: z.string().optional(),
  saleCount: z.number().int().nonnegative().optional(),
  saleAmount: z.number().nonnegative().optional(),
  voidCount: z.number().int().nonnegative().optional(),
  voidAmount: z.number().nonnegative().optional(),
  refundCount: z.number().int().nonnegative().optional(),
  refundAmount: z.number().nonnegative().optional(),
  currency: CurrencySchema.optional(), // ISO 4217 standartı
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

// Tip çıkarımları (Interfaces yerine bunları kullanabilirsin)
export type IyzicoTerminalTransactionResponse = z.infer<typeof IyzicoTerminalTransactionResponseSchema>;
export type IyzicoTerminalEodResponse = z.infer<typeof IyzicoTerminalEodResponseSchema>;