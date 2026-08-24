import { Module as IModule } from '@shared';
import {
  ActiveSubscriptionReadModel,
  EntitlementSource,
} from '@modules/platform/subscription/domain/contracts';
import { SubscriptionOwnerRef } from '@modules/platform/subscription/domain/repositories/subscription/subscription.command.repository';

export const SUBSCRIPTION_QUERY_REPOSITORY = Symbol(
  'ISubscriptionQueryRepository'
);

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
