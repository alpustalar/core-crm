import { FinanceLedger as IFinanceLedger, Pagination } from '@shared';
import {
  GetSummaryFilter,
  LedgerSummary,
  PatientFinanceSummary,
  PatientLedgerItem,
  PatientRevenue,
  SumIncomeByPatientsFilter,
} from '@modules/finance/finance-ledger/domain/contracts/finance-ledger';

export const FINANCE_LEDGER_QUERY_REPOSITORY = Symbol(
  'IFinanceLedgerQueryRepository'
);

export interface IFinanceLedgerQueryRepository {
  findManyByClinicId(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: IFinanceLedger[]; total: number }>;
  findManyByPatientIdWithDetails(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: PatientLedgerItem[]; total: number }>;
  getPatientSummary(patientId: string): Promise<PatientFinanceSummary>;
  getClinicSummary(
    clinicId: string,
    filter: GetSummaryFilter
  ): Promise<LedgerSummary>;
  /** Verilen hastaların dönem içi INCOME (COMPLETED) gelirini hasta-başı toplar. */
  sumIncomeByPatientIds(
    filter: SumIncomeByPatientsFilter
  ): Promise<PatientRevenue[]>;
}
