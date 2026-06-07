import { QueryResponse } from '@shared/common/response/response.interface';
import { AppointmentWithDetails } from '@modules/clinical/appointment/domain/types/appointment-with-details.type';

export type GetAppointmentDetailQueryResponse =
  QueryResponse<AppointmentWithDetails>;
