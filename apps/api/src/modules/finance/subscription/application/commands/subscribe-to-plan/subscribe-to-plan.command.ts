import { ActorContext } from '@common/interfaces';
import { PlanId } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { SubscriptionBuyerInfo } from '@modules/finance/subscription/infrastructure/adapters/billing-adapter.interface';

export interface SubscribeToPlanCommandProps {
  organizationId: string;
  planId: PlanId;
  priceAtPurchase: Decimal;
  actor: ActorContext;
  buyer?: SubscriptionBuyerInfo; // FREE_TRIAL için opsiyonel, ücretli planlar için zorunlu
  externalId?: string;
  externalPriceId?: string;
}

export class SubscribeToPlanCommand {
  organizationId: string;
  planId: PlanId;
  priceAtPurchase: Decimal;
  actor: ActorContext;
  buyer?: SubscriptionBuyerInfo;
  externalId?: string;
  externalPriceId?: string;

  constructor(props: SubscribeToPlanCommandProps) {
    Object.assign(this, props);
  }
}
