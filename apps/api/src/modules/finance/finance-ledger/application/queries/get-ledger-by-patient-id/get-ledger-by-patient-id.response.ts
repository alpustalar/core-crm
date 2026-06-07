import { QueryResponse } from '@shared/common/response/response.interface';
import { PatientLedgerItem } from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';

export type GetLedgerByPatientIdQueryResponse = QueryResponse<
  PatientLedgerItem[]
>;
