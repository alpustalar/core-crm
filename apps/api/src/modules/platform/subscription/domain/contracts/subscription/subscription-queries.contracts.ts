import { Decimal } from 'decimal.js';

/**
 * Aktif abonelik okuma modeli — query repo Prisma include'ından düz shape kurar (entity/UUID VO
 * sızmaz). `get-active-subscription` handler'ı bunu döner.
 */
export interface ActiveSubscriptionItemReadModel {
  id: string;
  planId: string | null;
  moduleId: string | null;
  priceAtPurchase: Decimal;
  currency: string;
  module: { key: string; name: string; monthlyPrice: Decimal } | null;
}

export interface ActiveSubscriptionReadModel {
  id: string;
  billingTarget: string;
  organizationId: string;
  clinicId: string | null;
  status: string;
  externalId: string | null;
  trialEndsAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  items: ActiveSubscriptionItemReadModel[];
  /** Aboneliğin planına dahil (bundle) modüller — plan tanımından türetilir (get-active handler doldurur). */
  planModules: { id: string; key: string; name: string }[];
}

/** Yenileme tutarı okuma modeli — aboneliğin aktif kalemlerinin (plan + modüller) toplamı. */
export interface RenewalChargeModel {
  amount: Decimal;
  currency: string;
}

/**
 * Entitlement çözümlemesini besleyen ham abonelik durumu (query repo döner). Handler bunu
 * plan bundle modülleri + eklenti modüllerle birleştirip erişim kararını verir.
 */
export interface EntitlementSource {
  status: string;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  /** Plan item'ının planId'si (deneme sürümünde FREE_TRIAL); yoksa null. */
  planId: string | null;
  /** Eklenti (add-on) modül kalemlerinin anahtarları. */
  addOnModuleKeys: string[];
}
