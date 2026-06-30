import { QueryResponse } from '@shared/common/response/response.interface';
import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';

/** Kliniğin IANA zaman dilimini döner (ör. "Europe/Istanbul"). */
export type GetClinicTimezoneResponse = QueryResponse<TimeZoneType>;
