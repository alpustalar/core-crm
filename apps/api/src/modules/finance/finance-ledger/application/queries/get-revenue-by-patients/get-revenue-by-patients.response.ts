import { QueryResponse } from '@shared/common/response/response.interface';
import { PatientRevenue } from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';

export type GetRevenueByPatientsResponse = QueryResponse<PatientRevenue[]>;
