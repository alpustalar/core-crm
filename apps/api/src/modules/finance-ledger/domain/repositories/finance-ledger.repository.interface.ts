import {
  FinanceLedger,
  LedgerCategory,
  LedgerSource,
  LedgerStatus,
  LedgerType,
  PaymentMethod,
} from '@prisma/client';
import { Pagination } from '@shared';

export interface CreateLedgerEntryData {
  clinicId: string;
  patientId?: string | null;
  paymentId?: string | null;
  installmentId?: string | null;
  performedById?: string | null;
  type: LedgerType;
  source: LedgerSource;
  category: LedgerCategory;
  amount: string;
  currency?: string;
  taxRate?: number;
  description?: string;
  documentNo?: string;
  entryDate?: Date;
}

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

export const FINANCE_LEDGER_REPOSITORY = Symbol('IFinanceLedgerRepository');

export interface IFinanceLedgerRepository {
  create(data: CreateLedgerEntryData): Promise<FinanceLedger>;
  findById(id: string): Promise<FinanceLedger | null>;
  findManyByClinicId(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedger[]; total: number }>;
  findManyByPatientId(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedger[]; total: number }>;
  findManyByPatientIdWithDetails(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: PatientLedgerItem[]; total: number }>;
  getPatientSummary(patientId: string): Promise<PatientFinanceSummary>;
  findManyByPaymentId(paymentId: string): Promise<FinanceLedger[]>;
  updateStatus(id: string, status: LedgerStatus): Promise<FinanceLedger>;
  updateManyStatusByPaymentId(
    paymentId: string,
    status: LedgerStatus
  ): Promise<void>;
  getClinicSummary(
    clinicId: string,
    filter: GetSummaryFilter
  ): Promise<LedgerSummary>;
}
