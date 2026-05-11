import {
  FinanceLedger,
  LedgerCategory,
  LedgerSource,
  LedgerStatus,
  LedgerType,
} from '@prisma/client';
import { Pagination } from '@shared';

export interface CreateLedgerEntryData {
  clinicId: string;
  patientId?: string | null;
  paymentId?: string | null;
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

export abstract class IFinanceLedgerRepository {
  abstract create(data: CreateLedgerEntryData): Promise<FinanceLedger>;
  abstract findById(id: string): Promise<FinanceLedger | null>;
  abstract findManyByClinicId(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedger[]; total: number }>;
  abstract findManyByPatientId(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedger[]; total: number }>;
  abstract findManyByPaymentId(paymentId: string): Promise<FinanceLedger[]>;
  abstract updateStatus(
    id: string,
    status: LedgerStatus
  ): Promise<FinanceLedger>;
  abstract updateManyStatusByPaymentId(
    paymentId: string,
    status: LedgerStatus
  ): Promise<void>;
  abstract getClinicSummary(
    clinicId: string,
    filter: GetSummaryFilter
  ): Promise<LedgerSummary>;
}
