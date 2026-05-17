import { PlanId, SubStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface SubscriptionItemResponse {
  id: string;
  planId: PlanId | null;
  moduleId: string | null;
  priceAtPurchase: Decimal;
  module: { key: string; name: string; monthlyPrice: Decimal } | null;
}

export interface GetActiveSubscriptionResponse {
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
