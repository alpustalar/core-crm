import { QueryResponse } from '@shared/common/response/response.interface';
import { ClinicDailySummary } from '@modules/clinical/appointment/domain/contracts/appointment';

export type GetClinicDailySummaryQueryResponse =
  QueryResponse<ClinicDailySummary>;
