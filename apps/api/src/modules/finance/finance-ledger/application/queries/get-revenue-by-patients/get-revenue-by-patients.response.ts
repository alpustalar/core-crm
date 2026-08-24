import { QueryResponse } from '@shared/common/response/response.interface';
import { PatientRevenue } from '@modules/finance/finance-ledger/domain/contracts/finance-ledger';

export type GetRevenueByPatientsResponse = QueryResponse<PatientRevenue[]>;
