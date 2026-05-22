import { QueryResponse } from '@shared/common/response/response.interface';
import { PatientFinanceSummary } from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';

export type GetPatientFinanceSummaryQueryResponse =
  QueryResponse<PatientFinanceSummary>;
