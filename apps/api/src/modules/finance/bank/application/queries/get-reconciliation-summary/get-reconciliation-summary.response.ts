import { QueryResponse } from '@shared/common/response/response.interface';
import { ReconciliationSummary } from '@modules/finance/bank/domain/contracts';

export type GetReconciliationSummaryResponse =
  QueryResponse<ReconciliationSummary | null>;
