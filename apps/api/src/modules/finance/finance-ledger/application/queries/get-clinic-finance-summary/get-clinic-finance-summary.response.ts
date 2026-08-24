import { QueryResponse } from '@shared/common/response/response.interface';
import { LedgerSummary } from '@modules/finance/finance-ledger/domain/contracts/finance-ledger';

export type GetClinicFinanceSummaryQueryResponse = QueryResponse<LedgerSummary>;
