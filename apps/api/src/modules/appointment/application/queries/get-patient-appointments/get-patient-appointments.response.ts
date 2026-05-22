import { QueryResponse } from '@shared/common/response/response.interface';
import { Appointment } from '@modules/appointment/domain/entities/appointment.entity';

export type GetPatientAppointmentsQueryResponse = QueryResponse<Appointment[]>;
