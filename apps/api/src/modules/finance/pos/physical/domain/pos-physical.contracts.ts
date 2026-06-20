import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { Decimal } from 'decimal.js'; // Katı tip güvenliği için standardizasyon

// ==========================================
// 1. POS DEVICE & SNAPSHOT SÖZLEŞMELERI
// ==========================================

export const CreatePosDeviceDataSchema = z.object({
  id: z.uuid(),
  clinicId: z.uuid(),
  label: z.string().min(1, 'POS cihazı etiketi zorunludur'), // Örn: "Garanti Bankası - Giriş POS"
  terminalId: z.string().min(1, 'Terminal ID zorunludur'),
  merchantId: z.string().min(1, 'Merchant ID (Üye İşyeri No) zorunludur'),
  host: z.string().min(1, 'Host adresi zorunludur'), // IP veya URL
  port: z.number().int().positive('Geçersiz port numarası'),
});
export type CreatePosDeviceData = z.infer<typeof CreatePosDeviceDataSchema>;

export const PendingTransactionDeviceSnapshotSchema = z.object({
  host: z.string(),
  port: z.number().int().positive(),
  terminalId: z.string(),
  merchantId: z.string(),
});
export type PendingTransactionDeviceSnapshot = z.infer<
  typeof PendingTransactionDeviceSnapshotSchema
>;

// ==========================================
// 2. TRANSACTION & RECONCILIATION SÖZLEŞMELERI
// ==========================================

export const CreatePosTransactionDataSchema = z.object({
  id: z.uuid(),
  posDeviceId: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid().optional(),
  appointmentId: z.uuid().optional(),
  paymentId: z.uuid().optional(),

  amount: z.number().positive("İşlem tutarı 0'dan büyük olmalıdır"),
  currency: CurrencySchema.optional(),
  externalRef: z.string().optional(), // Bankadan dönen referans/provizyon kodu
  rawRequest: z.unknown().optional(),
});
export type CreatePosTransactionProps = z.infer<
  typeof CreatePosTransactionDataSchema
>;

export const PendingTransactionForReconcileSchema = z.object({
  id: z.uuid(),
  posDeviceId: z.uuid(),
  clinicId: z.uuid(),

  // Prisma runtime kütüphanesinden gelen Decimal yapısı için zırhlı kontrol:
  amount: z.custom<Decimal>(
    (val) => val instanceof Decimal || Decimal.isDecimal(val)
  ),

  currency: z.string(),
  initiatedAt: z.date(),

  // nested nesne validasyonu:
  device: PendingTransactionDeviceSnapshotSchema,
});
export type PendingTransactionForReconcile = z.infer<
  typeof PendingTransactionForReconcileSchema
>;
