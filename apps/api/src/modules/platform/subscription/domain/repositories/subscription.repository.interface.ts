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
  /**
   * Aboneliği `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction içinde.
   * Para hareketi (yenileme tahsilatı) ve erişim kesme (expire) kararlarını besleyen
   * her okuma buradan yapılır; aksi halde iki zamanlanmış çalıştırma aynı aboneliği
   * görüp kartı iki kez çekebilir.
   */
  findByIdForUpdate(id: string): Promise<Subscription | null>;
  /** Sağlayıcı referansıyla kilitleyerek yükler (ödeme callback'i) — yalnız transaction içinde. */
  findByExternalIdForUpdate(externalId: string): Promise<Subscription | null>;
  /** Sahip (org veya klinik) için abonelik var mı — mükerrer abonelik/çift faturalama guard'ı. */
  existsByOwner(owner: SubscriptionOwnerRef): Promise<boolean>;
  /**
   * Deneme süresi (trialEndsAt) dolan abonelik ADAYLARI — trial-expiry processor.
   * Sonuç bir adaydır: her satır işlenmeden önce `findByIdForUpdate` ile kilitli
   * yeniden okunur, çünkü tarama ile işleme arasında müşteri ödeme yapmış olabilir.
   */
  findExpiredTrials(now: Date): Promise<Subscription[]>;
  /** Yenileme günü gelmiş abonelik ADAYLARI — renewal processor (yukarıdaki not geçerli). */
  findDueForRenewal(now: Date): Promise<Subscription[]>;
  /** PAST_DUE abonelik ADAYLARI — dunning/expire processor (yukarıdaki not geçerli). */
  findPastDue(): Promise<Subscription[]>;
  /** Aboneliğin aylık tahsilat tutarı (aktif kalemlerin toplamı) — çekilecek tutarı belirler. */
  findRenewalCharge(subscriptionId: string): Promise<RenewalChargeModel | null>;
}

export interface ISubscriptionQueryRepository {
  /** Org'un aboneliğini read-model olarak döner (org-billed). organizationId artık unique değil → findFirst. */
  findByOrganizationId(
    organizationId: string
  ): Promise<ActiveSubscriptionReadModel | null>;
  findModuleByKey(key: string): Promise<IModule | null>;
  /** Aktif eklenti modülleri kataloğu (list-modules). */
  findActiveModules(): Promise<IModule[]>;
  /**
   * Entitlement kaynağı — CLINIC-billed'de klinik aboneliği, yoksa org aboneliği (miras).
   * Guard/entitlement resolver besler. Abonelik yoksa null.
   */
  findEntitlementSource(
    owner: SubscriptionOwnerRef
  ): Promise<EntitlementSource | null>;
}
