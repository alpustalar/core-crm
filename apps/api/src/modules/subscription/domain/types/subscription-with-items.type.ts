import { Subscription } from '@modules/subscription/domain/entities/subscription.entity';
import { SubscriptionItem } from '@modules/subscription/domain/entities/subscription-item.entity';

export type SubscriptionWithItems = Subscription & { items: SubscriptionItem[] };
