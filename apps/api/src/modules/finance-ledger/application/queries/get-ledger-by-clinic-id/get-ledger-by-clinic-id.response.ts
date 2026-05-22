import { QueryResponse } from '@shared/common/response/response.interface';
import { FinanceLedger } from '@prisma/client';

export type GetLedgerByClinicIdQueryResponse = QueryResponse<FinanceLedger[]>;
