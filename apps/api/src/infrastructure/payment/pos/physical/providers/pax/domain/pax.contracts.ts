import { z } from 'zod';
import { HostSchema } from '@shared/common/schemas';
import { PortSchema } from '@shared/common/schemas/port-schema';

// ==========================================
// 1. PAX CİHAZ YAPILANDIRMA SÖZLEŞMESİ (CONFIG)
// ==========================================

export const PaxDeviceConfigSchema = z.object({
  host: HostSchema,
  port: PortSchema,
  terminalId: z.string().min(1, 'Terminal ID boş bırakılamaz'),
  merchantId: z.string().min(1, 'Merchant ID boş bırakılamaz'),
});
export type PaxDeviceConfig = z.infer<typeof PaxDeviceConfigSchema>;

// ==========================================
// 2. PAX GİRDİ SÖZLEŞMELERİ (INPUTS)
// ==========================================

export const PaxSaleInputSchema = z.object({
  device: PaxDeviceConfigSchema,
  amountInMinorUnits: z
    .number()
    .int()
    .positive("Satış tutarı 0'dan büyük ve tamsayı olmalıdır"),
  ecReferenceNumber: z.string().min(1, 'ECR referans numarası zorunludur'),
  timeout: z.number().int().positive().optional(),
});
export type PaxSaleInput = z.infer<typeof PaxSaleInputSchema>;

export const PaxRefundInputSchema = z.object({
  device: PaxDeviceConfigSchema,
  amountInMinorUnits: z
    .number()
    .int()
    .positive("İade tutarı 0'dan büyük ve tamsayı olmalıdır"),
  ecReferenceNumber: z.string().min(1, 'ECR referans numarası zorunludur'),
  originalReferenceNumber: z.string().optional(),
  timeout: z.number().int().positive().optional(),
});
export type PaxRefundInput = z.infer<typeof PaxRefundInputSchema>;

export const PaxVoidInputSchema = z.object({
  device: PaxDeviceConfigSchema,
  amountInMinorUnits: z
    .number()
    .int()
    .positive("İptal tutarı 0'dan büyük ve tamsayı olmalıdır"),
  ecReferenceNumber: z.string().min(1, 'ECR referans numarası zorunludur'),
  originalReferenceNumber: z
    .string()
    .min(1, 'Orijinal işlem referans numarası zorunludur'),
  timeout: z.number().int().positive().optional(),
});
export type PaxVoidInput = z.infer<typeof PaxVoidInputSchema>;

export const PaxBatchCloseInputSchema = z.object({
  device: PaxDeviceConfigSchema,
  timeout: z.number().int().positive().optional(),
});
export type PaxBatchCloseInput = z.infer<typeof PaxBatchCloseInputSchema>;

// ==========================================
// 3. PAX ÇIKTI SÖZLEŞMELERİ (RESULTS)
// ==========================================

export const PaxResultSchema = z.object({
  approved: z.boolean(),
  responseCode: z.string(),
  responseText: z.string(),
  authorizationCode: z.string().optional(),
  cardType: z.string().optional(),
  maskedCardNumber: z.string().optional(),
  externalRef: z.string().optional(),
  ecReferenceNumber: z.string().optional(),
  rawResponse: z.record(z.string(), z.string()), // Donanımdan dönen ham key-value haritası
});
export type PaxResult = z.infer<typeof PaxResultSchema>;

export const PaxBatchCloseResultSchema = z.object({
  success: z.boolean(),
  responseCode: z.string(),
  responseText: z.string(),
  rawResponse: z.record(z.string(), z.string()),
});
export type PaxBatchCloseResult = z.infer<typeof PaxBatchCloseResultSchema>;
