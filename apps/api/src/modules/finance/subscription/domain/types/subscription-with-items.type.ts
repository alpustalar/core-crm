import { Subscription } from '@modules/finance/subscription/domain/entities/subscription.entity';
import { SubscriptionItem } from '@modules/finance/subscription/domain/entities/subscription-item.entity';

export type SubscriptionWithItems = Subscription & {
  items: SubscriptionItem[];
};
