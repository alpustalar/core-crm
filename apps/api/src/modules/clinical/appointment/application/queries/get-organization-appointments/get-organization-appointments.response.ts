import { QueryResponse } from '@shared/common/response/response.interface';
import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';

export type GetOrganizationAppointmentsQueryResponse = QueryResponse<
  Appointment[]
>;
