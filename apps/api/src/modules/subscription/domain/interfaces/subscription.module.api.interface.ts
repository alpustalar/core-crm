import { ActorContext } from '@common/interfaces';
import { PlanId } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { QueryResponse } from '@shared/common/response/response.interface';
import { GetActiveSubscriptionResponse } from '@modules/subscription/application/queries/get-active-subscription/get-active-subscription.response';

export const SUBSCRIPTION_MODULE_API_TOKEN = Symbol('ISubscriptionModuleApi');

export interface SubscribeToPlanInput {
  organizationId: string;
  planId: PlanId;
  priceAtPurchase: Decimal;
  actor: ActorContext;
  externalId?: string;
  externalPriceId?: string;
}

export interface AddModuleInput {
  organizationId: string;
  moduleKey: string;
  actor: ActorContext;
  externalPriceId?: string;
}

export interface ISubscriptionModuleApi {
  subscribeToPlan(input: SubscribeToPlanInput): Promise<void>;
  addModule(input: AddModuleInput): Promise<void>;
  getActiveSubscription(
    organizationId: string
  ): Promise<QueryResponse<GetActiveSubscriptionResponse | null>>;
}
