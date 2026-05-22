import {
  IClinicAvailability,
  IClinicException,
} from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import { QueryResponse } from '@shared/common/response/response.interface';

export type GetClinicScheduleQueryResponse = QueryResponse<{
  availabilities: IClinicAvailability[];
  exceptions: IClinicException[];
}>;
