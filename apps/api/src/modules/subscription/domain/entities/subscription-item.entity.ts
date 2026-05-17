import {
  PlanId,
  SubscriptionItem as PrismaSubscriptionItem,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class SubscriptionItem implements PrismaSubscriptionItem {
  id: string;
  subscriptionId: string;
  planId: PlanId | null;
  moduleId: string | null;
  priceAtPurchase: Decimal;
  externalPriceId: string | null;
  createdAt: Date;

  get isPlan(): boolean {
    return this.planId !== null;
  }

  get isModule(): boolean {
    return this.moduleId !== null;
  }
}
