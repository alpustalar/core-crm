import { QueryResponse } from '@shared/common/response/response.interface';
import { PatientLedgerItem } from '@modules/finance/finance-ledger/domain/contracts/finance-ledger';

export type GetLedgerByPatientIdQueryResponse = QueryResponse<
  PatientLedgerItem[]
>;
