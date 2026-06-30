import { QueryResponse } from '@shared/common/response/response.interface';
import { AppointmentWithDetails } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

export type GetAppointmentDetailQueryResponse =
  QueryResponse<AppointmentWithDetails>;
