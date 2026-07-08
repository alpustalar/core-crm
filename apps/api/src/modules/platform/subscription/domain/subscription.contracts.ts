import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { PlanIdSchema } from '@input-type-schemas/PlanIdSchema';
import { BillingTargetSchema } from '@input-type-schemas/BillingTargetSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';

// ==========================================
// READ-MODEL & CREATE TİPLERİ (düz shape — entity DEĞİL)
// ==========================================

/** SubscriptionItem oluşturma girişi (entity static create). priceAtPurchase Money VO ile zırhlı. */
export const CreateSubscriptionItemPropsSchema = z.object({
  id: z.uuid().optional(),
  subscriptionId: z.uuid(),
  planId: PlanIdSchema.optional(),
  moduleId: z.uuid().optional(),
  priceAtPurchase: z.custom<Money>((val) => val instanceof Money),
  externalPriceId: z.string().optional(),
});
export type CreateSubscriptionItemProps = z.infer<
  typeof CreateSubscriptionItemPropsSchema
>;

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

export const CreateSubscriptionPropsSchema = z
  .object({
    id: z.uuid().optional(),
    billingTarget: BillingTargetSchema, // ORGANIZATION | CLINIC (org ayarından türetilir)
    organizationId: z.uuid('Organization ID zorunludur'), // sahip org (her zaman)
    clinicId: z.uuid().optional(), // yalnız CLINIC hedefte
    externalId: z.string().nullable().optional(), // Örn: Stripe Subscription ID (sub_...)

    trialEndsAt: z.date().nullable().optional(),
    currentPeriodStart: z.date().nullable().optional(),
    currentPeriodEnd: z.date().nullable().optional(),
  })
  .refine(
    (data) => {
      // Eğer periyotlar varsa, start < end kontrolü
      if (data.currentPeriodStart && data.currentPeriodEnd) {
        return data.currentPeriodEnd > data.currentPeriodStart;
      }
      return true;
    },
    {
      message: 'Periyot bitişi başlangıçtan sonra olmalıdır',
      path: ['currentPeriodEnd'],
    }
  );

export type CreateSubscriptionProps = z.infer<
  typeof CreateSubscriptionPropsSchema
>;

/**
 * Kayıtlı ödeme yöntemi oluşturma girişi (entity static create). İlk ödemenin callback'inde
 * iyzico'nun döndürdüğü cardUserKey/cardToken + alıcı snapshot'ı ile doldurulur.
 */
export const CreateSubscriptionPaymentMethodPropsSchema = z.object({
  id: z.uuid().optional(),
  subscriptionId: z.uuid(),
  provider: z.string().optional(),
  cardUserKey: z.string().min(1),
  cardToken: z.string().min(1),
  maskedNumber: z.string().nullable().optional(),
  cardAssociation: z.string().nullable().optional(),
  cardFamily: z.string().nullable().optional(),
  buyerName: z.string().min(1),
  buyerSurname: z.string().min(1),
  buyerEmail: z.string().min(1),
  buyerGsmNumber: z.string().min(1),
  buyerIp: z.string().min(1),
  buyerCity: z.string().nullable().optional(),
  buyerAddress: z.string().nullable().optional(),
});
export type CreateSubscriptionPaymentMethodProps = z.infer<
  typeof CreateSubscriptionPaymentMethodPropsSchema
>;

/**
 * Yenileme anında kayıtlı kartla tahsilat için gereken düz shape — payment method query repo
 * döner (renewal processor). Entity/token sızmaz; alıcı bilgisi payment.create'i besler.
 */
export interface SavedCardChargeModel {
  cardUserKey: string;
  cardToken: string;
  buyer: {
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    ip: string;
    city: string | null;
    address: string | null;
  };
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

export const ModuleCreatePropsSchema = z.object({
  id: z.uuid().optional(),
  key: z.string().min(1, 'Modül anahtarı zorunludur').toLowerCase(),
  name: z.string().min(1, 'Modül ismi zorunludur'),
  description: z
    .string()
    .max(500, 'Açıklama 500 karakteri geçemez')
    .nullable()
    .optional(),

  monthlyPrice: z.number().nonnegative('Fiyat negatif olamaz'),
  currency: CurrencySchema,
});

export type ModuleCreateProps = z.infer<typeof ModuleCreatePropsSchema>;

/** Modül güncelleme (admin) — verilen alanlar uygulanır. */
export const UpdateModulePropsSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().max(500).nullable().optional(),
  monthlyPrice: z.number().nonnegative().optional(),
  currency: CurrencySchema.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateModuleProps = z.infer<typeof UpdateModulePropsSchema>;

/** Plan tanımı oluşturma/güncelleme (admin) — sabit planId'ye fiyat + isim. */
export const CreatePlanPropsSchema = z.object({
  id: z.uuid().optional(),
  planId: PlanIdSchema,
  name: z.string().min(1, 'Plan ismi zorunludur'),
  monthlyPrice: z.number().nonnegative('Fiyat negatif olamaz'),
  currency: CurrencySchema,
});
export type CreatePlanProps = z.infer<typeof CreatePlanPropsSchema>;

/** Plan katalog okuma modeli — plan + içerdiği modüller (düz shape). */
export interface PlanReadModel {
  id: string;
  planId: string;
  name: string;
  monthlyPrice: Decimal;
  currency: string;
  isActive: boolean;
  modules: { id: string; key: string; name: string }[];
}
