import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { ResponseGroups } from '@common/constants/response-groups.constant';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';

/**
 * İşlem satırı, finans modülleriyle aynı serileştirme vokabülerini paylaşır:
 * satırın "ne yapıldı" tarafı klinik personeline (INTERNAL), fiyat/indirim
 * tarafı finansal tier'a açıktır.
 */
export const TreatmentChargeResponseGroups = ResponseGroups;

export type TreatmentChargeResponseGroup =
  (typeof TreatmentChargeResponseGroups)[keyof typeof TreatmentChargeResponseGroups];

// ============================================================================
// Entity giriş tipleri (Props)
// ============================================================================

/**
 * Satır oluşturma girişi. Fiyat alanları **hesaplanmaz halde** gelir: liste
 * fiyatı tedaviden çözülüp handler tarafından buraya taşınır, indirim/KDV
 * hesabını entity yapar.
 */
export const CreateTreatmentChargePropsSchema = z.object({
  id: z.uuid().optional(),
  organizationId: z.uuid(),
  clinicId: z.uuid(),
  appointmentId: z.uuid(),
  patientId: z.uuid(),
  treatmentId: z.uuid(),

  description: z.string().nullable().optional(),
  quantity: z.custom<Decimal>((val) => val instanceof Decimal),

  /** Tedavinin o anki liste fiyatı — satıra dondurulur. */
  listPrice: z.custom<Money>((val) => val instanceof Money),
  discountRate: z.custom<Decimal>((val) => val instanceof Decimal),
  discountReason: z.string().nullable().optional(),
  vatRate: z.custom<VatRate>((val) => val instanceof VatRate),

  /** Klinik ayarındaki indirim tavanı (%). Entity kuralı buna göre işler. */
  maxDiscountPercent: z.custom<Decimal>((val) => val instanceof Decimal),
  /** Aktör kliniği yönetiyor mu? Tavanı yalnız yönetici aşabilir. */
  canExceedDiscountLimit: z.boolean(),

  createdById: z.string().nullable().optional(),
});

export type CreateTreatmentChargeProps = z.infer<
  typeof CreateTreatmentChargePropsSchema
>;

/** Mevcut satırın indirimini değiştirme girişi. */
export const ApplyDiscountPropsSchema = z.object({
  discountRate: z.custom<Decimal>((val) => val instanceof Decimal),
  discountReason: z.string().nullable().optional(),
  maxDiscountPercent: z.custom<Decimal>((val) => val instanceof Decimal),
  canExceedDiscountLimit: z.boolean(),
  actorId: z.string().nullable().optional(),
});

export type ApplyDiscountProps = z.infer<typeof ApplyDiscountPropsSchema>;

/** Satır iptali girişi. */
export const VoidChargePropsSchema = z.object({
  reason: z.string().min(1),
});

export type VoidChargeProps = z.infer<typeof VoidChargePropsSchema>;

// ============================================================================
// Okuma modelleri
// ============================================================================

/**
 * Bir randevunun satır toplamları. Fatura ve tahsilat tutarları buradan türer;
 * tutarlar string'dir (Decimal serileştirme kaybı yaşanmasın diye).
 */
export const AppointmentChargeSummarySchema = z.object({
  appointmentId: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid(),
  currency: CurrencySchema,
  /** İndirimsiz toplam (liste × adet) */
  listTotal: z.string(),
  discountTotal: z.string(),
  /** Matrah (KDV hariç) */
  netTotal: z.string(),
  vatTotal: z.string(),
  /** Genel toplam (KDV dahil) — faturanın `amount`'ı budur */
  grandTotal: z.string(),
  /** Satırların ortak KDV oranı; fatura tek oranlı olduğu için tekil olmak zorunda */
  vatRate: z.number().int(),
  lineCount: z.number().int(),
});

export type AppointmentChargeSummary = z.infer<
  typeof AppointmentChargeSummarySchema
>;
