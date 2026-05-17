import { Subscription as PrismaSubscription, SubStatus } from '@prisma/client';

export class Subscription implements PrismaSubscription {
  id: string;
  organizationId: string;
  externalId: string | null;
  status: SubStatus;
  trialEndsAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;

  get isActive(): boolean {
    return this.status === SubStatus.ACTIVE;
  }

  get isOnTrial(): boolean {
    return !!this.trialEndsAt && this.trialEndsAt > new Date();
  }

  get isCanceled(): boolean {
    return this.status === SubStatus.CANCELED;
  }
}
