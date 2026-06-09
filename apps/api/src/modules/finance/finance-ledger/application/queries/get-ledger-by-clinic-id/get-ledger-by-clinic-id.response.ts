import { QueryResponse } from '@shared/common/response/response.interface';
import { FinanceLedgerEntity } from '@modules/finance/finance-ledger/domain/entities/finance-ledger.entity';

export type GetLedgerByClinicIdQueryResponse = QueryResponse<FinanceLedgerEntity[]>;
