import { Module, PlanId, Subscription, SubscriptionItem, SubStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const SUBSCRIPTION_REPO_TOKEN = Symbol('ISubscriptionRepository');

export type SubscriptionWithItems = Subscription & {
  items: (SubscriptionItem & { module: Module | null })[];
};

export type CreateSubscriptionInput = {
  organizationId: string;
  externalId?: string;
};

export type AddItemInput = {
  subscriptionId: string;
  planId?: PlanId;
  moduleId?: string;
  priceAtPurchase: Decimal;
  externalPriceId?: string;
};

export interface ISubscriptionRepository {
  create(data: CreateSubscriptionInput): Promise<Subscription>;
  findByOrganizationId(
    organizationId: string
  ): Promise<SubscriptionWithItems | null>;
  findByExternalId(externalId: string): Promise<Subscription | null>;
  addItem(data: AddItemInput): Promise<SubscriptionItem>;
  findModuleByKey(key: string): Promise<Module | null>;
  existsByOrganizationId(organizationId: string): Promise<boolean>;
  updateStatus(id: string, status: SubStatus): Promise<void>;
  updateExternalId(id: string, externalId: string): Promise<void>;
}
