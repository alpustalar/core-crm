import { QueryResponse } from '@shared/common/response/response.interface';
import { AppointmentChargeSummary } from '@modules/finance/treatment-charge/domain/contracts/treatment-charge';

export type GetAppointmentChargeSummaryResponse =
  QueryResponse<AppointmentChargeSummary | null>;
