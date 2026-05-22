import { ActorContext } from '@common/interfaces';
import { PlanId } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type SubscribeToPlanProps = {
  organizationId: string;
  planId: PlanId;
  priceAtPurchase: Decimal;
  actor: ActorContext;
  externalId?: string;
  externalPriceId?: string;
};
