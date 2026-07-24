import { QueryResponse } from '@shared/common/response/response.interface';
import { Appointment } from '@shared';

export type SearchClinicAppointmentsQueryResponse = QueryResponse<
  Appointment[]
>;
