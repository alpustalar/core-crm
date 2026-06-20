import { z } from 'zod';
import { Decimal } from 'decimal.js';
import { PlanIdSchema } from '@input-type-schemas/PlanIdSchema';
import { Money } from '@src/domain/value-objects/money.vo';
import { Subscription } from '@modules/finance/subscription/domain/entities/subscription.entity';
import { SubscriptionItem } from '@modules/finance/subscription/domain/entities/subscription-item.entity';

// ==========================================
// 1. DATA / REPOSITORY SEVİYESİ SÖZLEŞMELERİ
// ==========================================

export const AddItemDataSchema = z.object({
  subscriptionId: z.uuid(),
  planId: PlanIdSchema.optional(),
  moduleId: z.uuid().optional(),

  // CLAUDE.md: Money VO koruması (Zırhlı Yapı)
  priceAtPurchase: z.custom<Money>((val) => val instanceof Money),

  externalPriceId: z.string().optional(), // Stripe / iyzico fiyat ID karşılığı
});
export type AddItemData = z.infer<typeof AddItemDataSchema>;

export const CreateSubscriptionDataSchema = z.object({
  organizationId: z.uuid(),
  externalId: z.string().optional(), // Stripe / iyzico abonelik ID karşılığı
});
export type CreateSubscriptionData = z.infer<
  typeof CreateSubscriptionDataSchema
>;

// ==========================================
// 2. PROPS / COMMAND SEVİYESİ SÖZLEŞMELERİ
// ==========================================

// Projedeki ActorContext yapısı için esnek ama güvenli custom sarmalayıcı
const ActorContextSchema = z.custom<any>(
  (val) => val !== null && typeof val === 'object'
);

export const AddModulePropsSchema = z.object({
  organizationId: z.uuid(),
  moduleKey: z.string().min(1, 'Modül anahtarı (key) boş olamaz'), // Örn: "ORAL_DIAGNOSIS_MOD"
  actor: ActorContextSchema,
  externalPriceId: z.string().optional(),
});
export type AddModuleProps = z.infer<typeof AddModulePropsSchema>;

export const SubscribeToPlanPropsSchema = z.object({
  organizationId: z.uuid(),
  planId: PlanIdSchema,

  // Decimal türündeki mali satın alma fiyatı zırhı:
  priceAtPurchase: z.custom<Decimal>((val) => val instanceof Decimal),

  actor: ActorContextSchema,
  externalId: z.string().optional(),
  externalPriceId: z.string().optional(),
});
export type SubscribeToPlanProps = z.infer<typeof SubscribeToPlanPropsSchema>;

// ==========================================
// 3. COMBINED / RELATIONAL TYPES (SADECE TİP GÜVENCESİ)
// ==========================================

/**
 * Zod runtime doğrulamasından ziyade, DB sorgularında "include" edilen ilişkisel yapıyı
 * compile-time seviyesinde korumak için doğrudan saf TypeScript birleşimi olarak mühürlendi.
 */
export type SubscriptionWithItems = Subscription & {
  items: SubscriptionItem[];
};
