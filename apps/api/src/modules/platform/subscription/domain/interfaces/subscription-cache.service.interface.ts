import { TenantEntitlements } from '@common/interfaces';

export const SUBSCRIPTION_CACHE_SERVICE = Symbol('ISubscriptionCacheService');

export interface ISubscriptionCacheService {
  tenantEntitlements: {
    set<T = TenantEntitlements>(payload: {
      organizationId: string;
      clinicId: string | null;
      entitlements: T;
    }): Promise<void>;

    get<T = TenantEntitlements>(
      organizationId: string,
      clinicId: string | null
    ): Promise<T | null>;

    delByOrganizationId(organizationId: string): Promise<void>;
  };
}
