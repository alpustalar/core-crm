import { QueryResponse } from '@shared';
import { Appointment } from '@modules/appointment/domain/entities/appointment.entity';

export type GetClinicAppointmentsQueryResponse = QueryResponse<Appointment[]>;
