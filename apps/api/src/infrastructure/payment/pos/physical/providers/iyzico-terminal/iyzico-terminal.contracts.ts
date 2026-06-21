import { z } from 'zod';
import { IyzicoTerminalCredentials } from '@src/infrastructure/payment/pos/physical/providers/iyzico-terminal/auth/iyzico-terminal-auth.types';

const IyzicoTerminalCredentialsSchema = z.custom<IyzicoTerminalCredentials>(
  (val) => val !== null && typeof val === 'object'
);

// ==========================================
// 1. ENUMS & CONSTANTS SÖZLEŞMELERİ
// ==========================================

export const IyzicoTerminalSalesTypeSchema = z.enum([
  'SALE',
  'PRE_AUTH',
  'POST_AUTH',
]);

export type IyzicoTerminalSalesType = z.infer<
  typeof IyzicoTerminalSalesTypeSchema
>;

export const IyzicoTerminalStatusSchema = z.enum(['SUCCESS', 'FAILURE']);
export const IyzicoTerminalLocaleSchema = z.enum(['tr', 'en']);

// ==========================================
// 2. INPUT SÖZLEŞMELERİ (INPUTS)
// ==========================================

export const IyzicoTerminalCompletePaymentInputSchema = z.object({
  credentials: IyzicoTerminalCredentialsSchema,
  deviceUniqueId: z
    .string()
    .min(1, 'Terminal cihaz benzersiz kimliği zorunludur'),
  conversationId: z.string().min(1, 'Conversation ID boş bırakılamaz'),
  transactionReferenceId: z
    .string()
    .min(1, 'İşlem referans numarası zorunludur'),
  price: z.number().positive("Ödeme tutarı 0'dan büyük olmalıdır"),
  currency: z.string().min(1),
  salesType: IyzicoTerminalSalesTypeSchema,
  installment: z.number().int().nonnegative('Taksit sayısı negatif olamaz'), // 0 = tek çekim
  paymentId: z.string().optional(), // POST_AUTH işlemlerinde zorunlu
  locale: IyzicoTerminalLocaleSchema.optional(),
});
export type IyzicoTerminalCompletePaymentInput = z.infer<
  typeof IyzicoTerminalCompletePaymentInputSchema
>;

export const IyzicoTerminalVoidPaymentInputSchema = z.object({
  credentials: IyzicoTerminalCredentialsSchema,
  deviceUniqueId: z.string().min(1),
  conversationId: z.string().min(1),
  transactionReferenceId: z.string().min(1),
  paymentId: z.string().min(1, 'İptal edilecek ödeme kimliği zorunludur'),
  paymentDate: z
    .string()
    .length(8, 'Tarih formatı YYYY.MM.DD şeklinde 8 hane olmalıdır'),
  reason: z.string().optional(),
  description: z.string().optional(),
  locale: IyzicoTerminalLocaleSchema.optional(),
});
export type IyzicoTerminalVoidPaymentInput = z.infer<
  typeof IyzicoTerminalVoidPaymentInputSchema
>;

export const IyzicoTerminalRefundPaymentInputSchema = z.object({
  credentials: IyzicoTerminalCredentialsSchema,
  deviceUniqueId: z.string().min(1),
  conversationId: z.string().min(1),
  transactionReferenceId: z.string().min(1),
  paymentId: z
    .string()
    .min(1, 'İade yapılacak orijinal ödeme kimliği zorunludur'),
  price: z.number().positive("İade tutarı 0'dan büyük olmalıdır"),
  paymentDate: z
    .string()
    .length(8, 'Tarih formatı YYYYMMDD şeklinde 8 hane olmalıdır'), // YYYYMMDD
  reason: z.string().optional(),
  description: z.string().optional(),
  locale: IyzicoTerminalLocaleSchema.optional(),
});
export type IyzicoTerminalRefundPaymentInput = z.infer<
  typeof IyzicoTerminalRefundPaymentInputSchema
>;

export const IyzicoTerminalEodInputSchema = z.object({
  credentials: IyzicoTerminalCredentialsSchema,
  deviceUniqueId: z.string().min(1),
  conversationId: z.string().min(1),
  useSummary: z.boolean().optional(),
  locale: IyzicoTerminalLocaleSchema.optional(),
});
export type IyzicoTerminalEodInput = z.infer<
  typeof IyzicoTerminalEodInputSchema
>;

export const IyzicoTerminalRefundPaymentResultSchema = z.object({
  status: IyzicoTerminalStatusSchema,
  conversationId: z.string(),
  transactionReferenceId: z.string(),
  paymentId: z.string(),
  paymentDate: z.string(),
  price: z.number().optional(),
  currency: z.string().optional(),
  authCode: z.string().optional(),
  hostReference: z.string().optional(),
  refundHostReference: z.string().optional(),
  systemTime: z.number().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  errorGroup: z.string().optional(),
});

// ==========================================
// 3. OUTPUT SÖZLEŞMELERİ (RESULTS)
// ==========================================

export const IyzicoTerminalPaymentResultSchema = z.object({
  status: IyzicoTerminalStatusSchema,
  conversationId: z.string(),
  transactionReferenceId: z.string(),
  authCode: z.string().optional(),
  paymentId: z.string().optional(),
  paymentDate: z.string().optional(),
  price: z.number(),
  currency: z.string(),
  installment: z.number().int(),
  binNumber: z.string().optional(),
  lastFourDigits: z.string().optional(),
  cardType: z.string().optional(),
  hostReference: z.string().optional(),
  batchNo: z.string().optional(),
  stanNo: z.string().optional(),
  bankMerchantId: z.string().optional(),
  bankTerminalId: z.string().optional(),
  posEntryModeCode: z.string().optional(),
  transactionDateTime: z.string().optional(),
  systemTime: z.number().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  errorGroup: z.string().optional(),
});
export type IyzicoTerminalPaymentResult = z.infer<
  typeof IyzicoTerminalPaymentResultSchema
>;

export const IyzicoTerminalVoidPaymentResultSchema = z.object({
  status: IyzicoTerminalStatusSchema,
  conversationId: z.string(),
  transactionReferenceId: z.string(),
  paymentId: z.string(),
  paymentDate: z.string(),
  price: z.number().optional(),
  currency: z.string().optional(),
  authCode: z.string().optional(),
  hostReference: z.string().optional(),
  cancelHostReference: z.string().optional(),
  systemTime: z.number().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  errorGroup: z.string().optional(),
});
export type IyzicoTerminalVoidPaymentResult = z.infer<
  typeof IyzicoTerminalVoidPaymentResultSchema
>;

export type IyzicoTerminalRefundPaymentResult = z.infer<
  typeof IyzicoTerminalRefundPaymentResultSchema
>;

export const IyzicoTerminalEodResultSchema = z.object({
  status: IyzicoTerminalStatusSchema,
  conversationId: z.string(),
  batchNo: z.string().optional(),
  saleCount: z.number().int().optional(),
  saleAmount: z.number().optional(),
  voidCount: z.number().int().optional(),
  voidAmount: z.number().optional(),
  refundCount: z.number().int().optional(),
  refundAmount: z.number().optional(),
  currency: z.string().optional(),
  systemTime: z.number().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  errorGroup: z.string().optional(),
});
export type IyzicoTerminalEodResult = z.infer<
  typeof IyzicoTerminalEodResultSchema
>;
