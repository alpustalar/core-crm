import { Appointment } from '@shared';
import { QueryResponse } from '@shared/common/response/response.interface';

export type GetClinicAppointmentsQueryResponse = QueryResponse<Appointment[]>;
