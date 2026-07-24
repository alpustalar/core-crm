import { QueryResponse } from '@shared/common/response/response.interface';
import { ConflictingAppointmentView } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

export type CheckAppointmentConflictsResponse = QueryResponse<
  ConflictingAppointmentView[]
>;
