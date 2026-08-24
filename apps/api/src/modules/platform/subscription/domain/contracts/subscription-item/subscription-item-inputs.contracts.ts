import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { Money } from '@src/domain/value-objects/money.vo';

/** SubscriptionItem oluşturma girişi (entity static create). priceAtPurchase Money VO ile zırhlı. */
export interface CreateSubscriptionItemProps {
  id?: string;
  subscriptionId: string;
  planId?: PlanId;
  moduleId?: string;
  priceAtPurchase: Money;
  externalPriceId?: string;
}
