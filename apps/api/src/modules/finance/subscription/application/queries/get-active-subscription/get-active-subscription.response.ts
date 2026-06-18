import { Decimal } from 'decimal.js';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { SubStatusType as SubStatus } from '@input-type-schemas/SubStatusSchema';

export interface SubscriptionItemResponse {
  id: string;
  planId: PlanId | null;
  moduleId: string | null;
  priceAtPurchase: Decimal;
  module: { key: string; name: string; monthlyPrice: Decimal } | null;
}

export interface GetActiveSubscriptionQueryResponse {
  id: string;
  organizationId: string;
  status: SubStatus;
  trialEndsAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  items: SubscriptionItemResponse[];
  createdAt: Date;
}
