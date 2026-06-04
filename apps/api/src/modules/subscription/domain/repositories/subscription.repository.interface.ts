import { Module as PrismaModule, SubStatus } from '@prisma/client';
import { Subscription } from '@modules/subscription/domain/entities/subscription.entity';
import { SubscriptionItem } from '@modules/subscription/domain/entities/subscription-item.entity';
import { CreateSubscriptionProps } from '@modules/subscription/domain/types/create-subscription.props';
import { AddItemProps } from '@modules/subscription/domain/types/add-item.props';
import { SubscriptionWithItems } from '@modules/subscription/domain/types/subscription-with-items.type';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const SUBSCRIPTION_COMMAND_REPOSITORY = Symbol(
  'ISubscriptionCommandRepository'
);
export const SUBSCRIPTION_QUERY_REPOSITORY = Symbol(
  'ISubscriptionQueryRepository'
);

export interface ISubscriptionCommandRepository
  extends IBaseCommandRepository<Subscription> {
  create(data: CreateSubscriptionProps): Promise<Subscription>;
  addItem(data: AddItemProps): Promise<SubscriptionItem>;
  updateStatus(id: string, status: SubStatus): Promise<void>;
  updateExternalId(id: string, externalId: string): Promise<void>;
}

export interface ISubscriptionQueryRepository {
  findByOrganizationId(
    organizationId: string
  ): Promise<SubscriptionWithItems | null>;
  findByExternalId(externalId: string): Promise<Subscription | null>;
  findModuleByKey(key: string): Promise<PrismaModule | null>;
  existsByOrganizationId(organizationId: string): Promise<boolean>;
}
