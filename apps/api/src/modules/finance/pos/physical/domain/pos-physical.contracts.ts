import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { PosProviderSchema } from '@input-type-schemas/PosProviderSchema';
import { Decimal } from 'decimal.js'; // Katı tip güvenliği için standardizasyon

// ==========================================
// 1. POS DEVICE & SNAPSHOT SÖZLEŞMELERI
// ==========================================

export const CreatePosDevicePropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  label: z.string().min(1, 'POS cihazı etiketi zorunludur'),
  // Varsayılan PAX (entity create içinde uygulanır); type seviyesinde opsiyonel.
  provider: PosProviderSchema.optional(),

  // PAX (POSLINK / TCP) — provider = PAX için zorunlu
  terminalId: z.string().min(1, 'Terminal ID zorunludur').nullable().optional(),
  merchantId: z
    .string()
    .min(1, 'Merchant ID (Üye İşyeri No) zorunludur')
    .nullable()
    .optional(),
  host: z.string().min(1, 'Host adresi zorunludur').nullable().optional(),
  port: z
    .number()
    .int()
    .positive('Geçersiz port numarası')
    .nullable()
    .optional(),

  // iyzico Terminal (Host API) — provider = IYZICO_TERMINAL için zorunlu
  deviceUniqueId: z
    .string()
    .min(1, 'Terminal cihaz benzersiz kimliği zorunludur')
    .nullable()
    .optional(),
});
export type CreatePosDeviceProps = z.infer<typeof CreatePosDevicePropsSchema>;

/** Bir PAX cihazına TCP bağlanmak için gereken, null olmayan bağlantı bilgisi. */
export interface PaxConnection {
  host: string;
  port: number;
  terminalId: string;
  merchantId: string;
}

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
// 1b. KLİNİK iyzico TERMINAL CONFIG SÖZLEŞMESİ
// ==========================================

export const CreateClinicIyzicoTerminalConfigPropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  clientId: z.string().min(1, 'iyzico clientId zorunludur'),
  clientSecret: z.string().min(1, 'iyzico clientSecret zorunludur'),
  username: z.string().min(1, 'iyzico kullanıcı adı zorunludur'),
  password: z.string().min(1, 'iyzico parolası zorunludur'),
});
export type CreateClinicIyzicoTerminalConfigProps = z.infer<
  typeof CreateClinicIyzicoTerminalConfigPropsSchema
>;

// ==========================================
// 2. TRANSACTION & RECONCILIATION SÖZLEŞMELERI
// ==========================================

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

export const CreatePosTransactionPropsSchema = z.object({
  // Kimlik bilgileri
  id: z.uuid('Geçersiz işlem ID formatı').optional(),
  posDeviceId: z.uuid("POS cihazı ID'si zorunludur"),

  // Kurumsal bağlam
  clinicId: z.uuid('Klinik ID zorunludur'),
  patientId: z.uuid('Hasta ID zorunludur').nullable().optional(),
  appointmentId: z.uuid('Randevu ID zorunludur').nullable().optional(),
  paymentId: z.string().nullable().optional(), // Eğer varsa ilgili ödeme kaydı

  // Finansal veriler
  amount: z.number().positive("İşlem tutarı 0'dan büyük olmalıdır"),
  currency: CurrencySchema,

  // Teknik veriler
  externalRef: z.string().nullable().optional(), // Banka veya ödeme kuruluşunun verdiği referans

  // Ham veri (JSON blob) - İleriye dönük debug ve denetim için
  rawRequest: z.any().nullable().optional(),
});

export type CreatePosTransactionProps = z.infer<
  typeof CreatePosTransactionPropsSchema
>;
