import { Module as IModule } from '@shared';

import { Subscription } from '@modules/finance/subscription/domain/entities/subscription.entity';
import { SubscriptionItem } from '@modules/finance/subscription/domain/entities/subscription-item.entity';
import { CreateSubscriptionData } from '@modules/finance/subscription/domain/types/create-subscription.data';
import { AddItemData } from '@modules/finance/subscription/domain/types/add-item.data';
import { SubscriptionWithItems } from '@modules/finance/subscription/domain/types/subscription-with-items.type';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';
import { SubStatusType as SubStatus } from '@input-type-schemas/SubStatusSchema';

export const SUBSCRIPTION_COMMAND_REPOSITORY = Symbol(
  'ISubscriptionCommandRepository'
);
export const SUBSCRIPTION_QUERY_REPOSITORY = Symbol(
  'ISubscriptionQueryRepository'
);

export interface ISubscriptionCommandRepository
  extends IBaseCommandRepository<Subscription> {
  create(data: CreateSubscriptionData): Promise<Subscription>;
  addItem(data: AddItemData): Promise<SubscriptionItem>;
  updateStatus(id: string, status: SubStatus): Promise<void>;
  updateExternalId(id: string, externalId: string): Promise<void>;
}

export interface ISubscriptionQueryRepository {
  findByOrganizationId(
    organizationId: string
  ): Promise<SubscriptionWithItems | null>;
  findByExternalId(externalId: string): Promise<Subscription | null>;
  findModuleByKey(key: string): Promise<IModule | null>;
  existsByOrganizationId(organizationId: string): Promise<boolean>;
}
