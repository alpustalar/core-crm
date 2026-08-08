import { QueryResponse } from '@shared/common/response/response.interface';
import { PatientFinanceSummary } from '@modules/finance/finance-ledger/domain/contracts/finance-ledger.contracts';

export type GetPatientFinanceSummaryQueryResponse =
  QueryResponse<PatientFinanceSummary>;
