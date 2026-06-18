import { QueryResponse } from '@shared/common/response/response.interface';
import { LedgerSummary } from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';

export type GetClinicFinanceSummaryQueryResponse = QueryResponse<LedgerSummary>;
