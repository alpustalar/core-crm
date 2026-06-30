import { QueryResponse } from '@shared/common/response/response.interface';
import { FinanceLedger } from '@shared';

export type GetLedgerByClinicIdQueryResponse = QueryResponse<FinanceLedger[]>;
