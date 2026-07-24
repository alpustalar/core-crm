import { ActorContext } from '@common/interfaces';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { Decimal } from 'decimal.js';
import { SubscriptionBuyerInfo } from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export class SubscribeToPlanCommand {
  constructor(
    public readonly payload: {
      organizationId: string;
      clinicId?: string;
      planId: PlanId;
      priceAtPurchase: Decimal;
      currency: CurrencyType;
      actor: ActorContext;
      buyer?: SubscriptionBuyerInfo;
      externalId?: string;
      externalPriceId?: string;
    }
  ) {}
}
