import { QueryResponse } from '@shared/common/response/response.interface';
import { ReconciliationSummary } from '@modules/finance/bank/domain/contracts/bank.contracts';

export type GetReconciliationSummaryResponse =
  QueryResponse<ReconciliationSummary | null>;
