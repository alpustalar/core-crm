import { z } from 'zod';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { Decimal } from 'decimal.js';
import PosProviderSchema from '@input-type-schemas/PosProviderSchema'; // Katı tip güvenliği için standardizasyon
import PosTransactionKindSchema from '@input-type-schemas/PosTransactionKindSchema';

// ==========================================
// 1. POS DEVICE & SNAPSHOT SÖZLEŞMELERI
// ==========================================

// 🪐 Ortak (Base) Alanlar: Her iki cihaz tipinde de her zaman ortak olanlar
const BasePosDeviceSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  label: z.string().min(1, 'POS cihazı etiketi zorunludur'),
});

export const CreatePosDevicePropsSchema = z.discriminatedUnion('provider', [
  // 🎯 1. PAX Cihazı İçin Zorunlu Kurallar
  BasePosDeviceSchema.extend({
    provider: z.literal(PosProviderSchema.enum.PAX),
    terminalId: z.string().min(1, 'PAX için Terminal ID zorunludur'),
    merchantId: z
      .string()
      .min(1, 'PAX için Merchant ID (Üye İşyeri No) zorunludur'),
    host: z.string().min(1, 'PAX için Host adresi zorunludur'),
    port: z.number().int().positive('Geçersiz port numarası'),

    deviceUniqueId: z.undefined().optional(),
  }),

  // 🎯 2. Iyzico Terminal Cihazı İçin Zorunlu Kurallar
  BasePosDeviceSchema.extend({
    provider: z.literal(PosProviderSchema.enum.IYZICO_TERMINAL),
    deviceUniqueId: z
      .string()
      .min(1, 'iyzico için Terminal cihaz benzersiz kimliği zorunludur'),

    // PAX alanları bu kolda kesinlikle gelemez
    terminalId: z.undefined().optional(),
    merchantId: z.undefined().optional(),
    host: z.undefined().optional(),
    port: z.undefined().optional(),
  }),
]);

// 🪐 TypeScript tip çıkarımı otomatik olarak Discriminated Union tipine dönüşür!
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

/**
 * Bir satışın CANLI (PENDING/SUCCESS) ters kayıtlarının özeti. İptal/iade kararını
 * besler: iptal en fazla bir kez yapılabilir, iadeler kümülatif olarak satışı aşamaz.
 * Command Context'e aittir — orijinal satır `FOR UPDATE` kilitliyken okunur.
 */
export const PosTransactionReversalSummarySchema = z.object({
  hasActiveVoid: z.boolean(),
  refundedAmount: z.custom<Decimal>(
    (val) => val instanceof Decimal || Decimal.isDecimal(val)
  ),
});
export type PosTransactionReversalSummary = z.infer<
  typeof PosTransactionReversalSummarySchema
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

  // Ters kayıt bilgisi — SALE dışındaki türler orijinal satışa bağlanmak zorundadır
  kind: PosTransactionKindSchema.optional(), // verilmezse SALE
  originalPosTransactionId: z
    .uuid('Geçersiz orijinal işlem ID formatı')
    .optional(),

  // Teknik veriler
  externalRef: z.string().nullable().optional(), // Banka veya ödeme kuruluşunun verdiği referans

  // Ham veri (JSON blob) - İleriye dönük debug ve denetim için
  rawRequest: z.any().nullable().optional(),
});

export type CreatePosTransactionProps = z.infer<
  typeof CreatePosTransactionPropsSchema
>;
