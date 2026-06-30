import { Appointment } from '@shared';
import { QueryResponse } from '@shared/common/response/response.interface';

export type GetPatientAppointmentsQueryResponse = QueryResponse<Appointment[]>;
