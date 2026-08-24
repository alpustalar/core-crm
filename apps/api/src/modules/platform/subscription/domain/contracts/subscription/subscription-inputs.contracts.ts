import { BillingTargetType as BillingTarget } from '@input-type-schemas/BillingTargetSchema';

// ==========================================
// ABONELİK — Entity static create() girişi
// ==========================================
// "currentPeriodEnd > currentPeriodStart" kuralı (eski .refine()) hiçbir zaman
// gerçek bir .parse() çağrısıyla enforce edilmiyordu; entity constructor'ı zaten
// DateRange.create() ile geçersiz/eksik aralığı sessizce null'a düşürüyor
// (bkz. subscription.entity.ts) — davranış bu dönüşümden önce de sonra da aynı.

export interface CreateSubscriptionProps {
  id?: string;
  billingTarget: BillingTarget; // ORGANIZATION | CLINIC (org ayarından türetilir)
  organizationId: string; // sahip org (her zaman) — Organization ID zorunludur
  clinicId?: string; // yalnız CLINIC hedefte
  externalId?: string | null; // Örn: Stripe Subscription ID (sub_...)

  trialEndsAt?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
}
