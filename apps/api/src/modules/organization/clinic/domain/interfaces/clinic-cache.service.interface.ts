import { ICacheOperations } from '@common/interfaces';

export interface IClinicCacheService {
  readonly slotLockTtlSeconds: number;

  clinicAppointmentSettings<T = unknown>(): ICacheOperations<T>;

  clinicIdByPatientId<T = { clinicId: string }>(): ICacheOperations<T>;

  clinicIdByProviderId<T = { clinicId: string }>(): ICacheOperations<T>;

  clinicOrganizationId<T = { clinicId: string }>(): ICacheOperations<T>;
}

export const CLINIC_CACHE_SERVICE = Symbol('IClinicCacheService');
