import { ActorContext } from '@common/interfaces';
import { SubscriptionBuyerInfo } from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';

export class AddModuleCommand {
  constructor(
    public readonly payload: {
      organizationId: string;
      moduleKey: string;
      actor: ActorContext;
      buyer?: SubscriptionBuyerInfo;
      externalPriceId?: string;
    }
  ) {}
}
