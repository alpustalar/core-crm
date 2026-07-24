import { ICacheOperations } from '@common/interfaces';

export interface IOrganizationCacheService {
  organizationIdByClinicId<
    T = { organizationId: string },
  >(): ICacheOperations<T>;
}

export const ORGANIZATION_CACHE_SERVICE = Symbol('IOrganizationCacheService');
