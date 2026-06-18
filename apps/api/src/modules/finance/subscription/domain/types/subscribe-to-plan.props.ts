import { ActorContext } from '@common/interfaces';
import { Decimal } from 'decimal.js';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';

export type SubscribeToPlanProps = {
  organizationId: string;
  planId: PlanId;
  priceAtPurchase: Decimal;
  actor: ActorContext;
  externalId?: string;
  externalPriceId?: string;
};
