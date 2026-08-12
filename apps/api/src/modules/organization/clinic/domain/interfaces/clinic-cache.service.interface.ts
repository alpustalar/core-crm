import { ICacheOperations } from '@common/interfaces';
import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';

export interface IClinicCacheService {
  readonly slotLockTtlSeconds: number;

  clinicAppointmentSettings<T = unknown>(): ICacheOperations<T>;

  clinicIdByPatientId<T = { clinicId: string }>(): ICacheOperations<T>;

  clinicIdByProviderId<T = { clinicId: string }>(): ICacheOperations<T>;

  clinicOrganizationId<T = { organizationId: string }>(): ICacheOperations<T>;

  clinicTimeZone<T = { timezone: TimeZoneType }>(): ICacheOperations<T>;
}

export const CLINIC_CACHE_SERVICE = Symbol('IClinicCacheService');
