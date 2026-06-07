import { QueryResponse } from '@shared';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';

export type GetClinicAppointmentsQueryResponse = QueryResponse<Appointment[]>;
