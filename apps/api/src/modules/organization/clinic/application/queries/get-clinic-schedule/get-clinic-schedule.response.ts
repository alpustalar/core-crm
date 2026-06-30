import { QueryResponse } from '@shared/common/response/response.interface';
import { ClinicAvailability, ClinicException } from '@shared';

type Schedule = {
  availabilities: ClinicAvailability[];
  exceptions: ClinicException[];
};

export type GetClinicScheduleQueryResponse = QueryResponse<Schedule>;
