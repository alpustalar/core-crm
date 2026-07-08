import { Module as IModule } from '@shared';

import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import {
  ActiveSubscriptionReadModel,
  EntitlementSource,
  RenewalChargeModel,
} from '@modules/platform/subscription/domain/subscription.contracts';

export const SUBSCRIPTION_COMMAND_REPOSITORY = Symbol(
  'ISubscriptionCommandRepository'
);
export const SUBSCRIPTION_QUERY_REPOSITORY = Symbol(
  'ISubscriptionQueryRepository'
);

/** Abonelik sahibi — org her zaman, clinicId yalnız CLINIC hedefte (franchise). */
export interface SubscriptionOwnerRef {
  organizationId: string;
  clinicId: string | null;
}

export interface ISubscriptionCommandRepository
  extends IBaseCommandRepository<Subscription> {
  sync(subscription: Subscription): Promise<Subscription | null>;
  syncMany(subscriptions: Subscription[]): Promise<void>;
}

export interface ISubscriptionQueryRepository {
  /** Org'un aboneliğini read-model olarak döner (org-billed). organizationId artık unique değil → findFirst. */
  findByOrganizationId(
    organizationId: string
  ): Promise<ActiveSubscriptionReadModel | null>;
  findByExternalId(externalId: string): Promise<Subscription | null>;
  findModuleByKey(key: string): Promise<IModule | null>;
  /** Aktif eklenti modülleri kataloğu (list-modules). */
  findActiveModules(): Promise<IModule[]>;
  /** Sahip (org veya klinik) için aktif/var olan abonelik var mı — subscribe guard'ı. */
  existsByOwner(owner: SubscriptionOwnerRef): Promise<boolean>;
  /**
   * Entitlement kaynağı — CLINIC-billed'de klinik aboneliği, yoksa org aboneliği (miras).
   * Guard/entitlement resolver besler. Abonelik yoksa null.
   */
  findEntitlementSource(
    owner: SubscriptionOwnerRef
  ): Promise<EntitlementSource | null>;
  /** Deneme süresi (trialEndsAt) dolan aktif FREE_TRIAL abonelikler — trial-expiry processor. */
  findExpiredTrials(now: Date): Promise<Subscription[]>;
  /** Yenileme günü gelmiş (currentPeriodEnd geçmiş, ACTIVE) abonelikler — renewal processor (entity). */
  findDueForRenewal(now: Date): Promise<Subscription[]>;
  /** Aboneliğin aylık tahsilat tutarı (aktif kalemlerin toplamı) — renewal auto-charge. Kalem yoksa null. */
  findRenewalCharge(subscriptionId: string): Promise<RenewalChargeModel | null>;
  /** PAST_DUE abonelikler — dunning/expire processor (entity). */
  findPastDue(): Promise<Subscription[]>;
}
