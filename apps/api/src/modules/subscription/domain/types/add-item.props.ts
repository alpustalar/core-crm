import { PlanId } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type AddItemProps = {
  subscriptionId: string;
  planId?: PlanId;
  moduleId?: string;
  priceAtPurchase: Decimal;
  externalPriceId?: string;
};
