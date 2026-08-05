import { Pagination } from '@shared';
import { FinanceLedgerEntity } from '../entities/finance-ledger.entity';
import { LedgerCategoryType as LedgerCategory } from '@input-type-schemas/LedgerCategorySchema';
import { LedgerStatusType as LedgerStatus } from '@input-type-schemas/LedgerStatusSchema';
import { PaymentMethodType as PaymentMethod } from '@input-type-schemas/PaymentMethodSchema';

export interface LedgerSummary {
  totalIncome: string;
  totalExpenses: string;
  balance: string;
  entryCount: number;
}

export interface GetSummaryFilter {
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PatientFinanceSummary {
  balance: string;
  totalServiceAmount: string;
  totalPayments: string;
}

export interface PatientLedgerItem {
  id: string;
  amount: string;
  category: LedgerCategory;
  entryDate: Date;
  status: LedgerStatus;
  description: string | null;
  paymentMethod: PaymentMethod | null;
  providerName: string | null;
}

/** Hasta-başı dönem geliri (attribution/ROI için). amount = INCOME/COMPLETED toplamı. */
export interface PatientRevenue {
  patientId: string;
  revenue: string;
}

export interface SumIncomeByPatientsFilter {
  patientIds: string[];
  from: Date;
  to: Date;
}

export const FINANCE_LEDGER_COMMAND_REPOSITORY = Symbol(
  'IFinanceLedgerCommandRepository'
);
export const FINANCE_LEDGER_QUERY_REPOSITORY = Symbol(
  'IFinanceLedgerQueryRepository'
);

export interface IFinanceLedgerCommandRepository {
  create(entry: FinanceLedgerEntity): Promise<FinanceLedgerEntity>;
  updateMany(entries: FinanceLedgerEntity[]): Promise<void>;
  updateStatus(id: string, status: LedgerStatus): Promise<void>;
  updateManyStatusByPaymentId(
    paymentId: string,
    status: LedgerStatus
  ): Promise<void>;
}

export interface IFinanceLedgerQueryRepository {
  findById(id: string): Promise<FinanceLedgerEntity | null>;
  findManyByClinicId(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedgerEntity[]; total: number }>;
  findManyByPatientId(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedgerEntity[]; total: number }>;
  findManyByPatientIdWithDetails(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: PatientLedgerItem[]; total: number }>;
  getPatientSummary(patientId: string): Promise<PatientFinanceSummary>;
  findManyByPaymentId(paymentId: string): Promise<FinanceLedgerEntity[]>;
  getClinicSummary(
    clinicId: string,
    filter: GetSummaryFilter
  ): Promise<LedgerSummary>;
  /** Verilen hastaların dönem içi INCOME (COMPLETED) gelirini hasta-başı toplar. */
  sumIncomeByPatientIds(
    filter: SumIncomeByPatientsFilter
  ): Promise<PatientRevenue[]>;
}
