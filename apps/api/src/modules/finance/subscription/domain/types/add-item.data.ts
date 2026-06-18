import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { Money } from '@src/domain/value-objects/money.vo';

export type AddItemData = {
  subscriptionId: string;
  planId?: PlanId;
  moduleId?: string;
  priceAtPurchase: Money;
  externalPriceId?: string;
};
