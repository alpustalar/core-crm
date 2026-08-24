import { Decimal } from 'decimal.js';
import { Money } from '@src/domain/value-objects/money.vo';
import { VatRate } from '@src/domain/value-objects/vat-rate.vo';

/**
 * TreatmentCharge domain kontratları — entity static `create()` girişi (Props)
 * ve durum geçişi metod girdileri.
 */

/**
 * Satır oluşturma girişi. Fiyat alanları **hesaplanmaz halde** gelir: liste
 * fiyatı tedaviden çözülüp handler tarafından buraya taşınır, indirim/KDV
 * hesabını entity yapar.
 */
export interface CreateTreatmentChargeProps {
  id?: string;
  organizationId: string;
  clinicId: string;
  appointmentId: string;
  patientId: string;
  treatmentId: string;

  description?: string | null;
  quantity: Decimal;

  /** Tedavinin o anki liste fiyatı — satıra dondurulur. */
  listPrice: Money;
  discountRate: Decimal;
  discountReason?: string | null;
  vatRate: VatRate;

  /** Klinik ayarındaki indirim tavanı (%). Entity kuralı buna göre işler. */
  maxDiscountPercent: Decimal;
  /** Aktör kliniği yönetiyor mu? Tavanı yalnız yönetici aşabilir. */
  canExceedDiscountLimit: boolean;

  createdById?: string | null;
}

/** Mevcut satırın indirimini değiştirme girişi. */
export interface ApplyDiscountProps {
  discountRate: Decimal;
  discountReason?: string | null;
  maxDiscountPercent: Decimal;
  canExceedDiscountLimit: boolean;
  actorId?: string | null;
}

/**
 * Satır iptali girişi. `reason` boş olamaz — HTTP sınırındaki
 * `VoidTreatmentChargeSchema` (min 1, max 300) bunu zaten doğrular.
 */
export interface VoidChargeProps {
  reason: string;
}
