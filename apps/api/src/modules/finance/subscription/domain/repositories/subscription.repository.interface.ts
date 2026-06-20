import { Module as IModule } from '@shared';

import { Subscription } from '@modules/finance/subscription/domain/entities/subscription.entity';
import { SubscriptionItem } from '@modules/finance/subscription/domain/entities/subscription-item.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';
import { SubStatusType as SubStatus } from '@input-type-schemas/SubStatusSchema';
import {
  AddItemData,
  CreateSubscriptionData,
  SubscriptionWithItems,
} from '@modules/finance/subscription/domain/subscription.contracts';

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
