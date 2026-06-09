import {
  LedgerCategory,
  LedgerStatus,
  PaymentMethod,
} from '@prisma/client';
import { Pagination } from '@shared';
import { FinanceLedgerEntity } from '../entities/finance-ledger.entity';


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

export const FINANCE_LEDGER_COMMAND_REPOSITORY = Symbol(
  'IFinanceLedgerCommandRepository'
);
export const FINANCE_LEDGER_QUERY_REPOSITORY = Symbol(
  'IFinanceLedgerQueryRepository'
);

export interface IFinanceLedgerCommandRepository {
  save(entry: FinanceLedgerEntity): Promise<FinanceLedgerEntity>;
  saveMany(entries: FinanceLedgerEntity[]): Promise<void>;
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
}
