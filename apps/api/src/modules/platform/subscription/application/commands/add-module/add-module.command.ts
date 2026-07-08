import { ActorContext } from '@common/interfaces';
import { SubscriptionBuyerInfo } from '@modules/platform/subscription/infrastructure/adapters/billing-adapter.interface';

export interface AddModuleCommandProps {
  organizationId: string;
  moduleKey: string;
  actor: ActorContext;
  buyer?: SubscriptionBuyerInfo;
  externalPriceId?: string;
}

export class AddModuleCommand {
  organizationId: string;
  moduleKey: string;
  actor: ActorContext;
  buyer?: SubscriptionBuyerInfo;
  externalPriceId?: string;

  constructor(props: AddModuleCommandProps) {
    Object.assign(this, props);
  }
}
