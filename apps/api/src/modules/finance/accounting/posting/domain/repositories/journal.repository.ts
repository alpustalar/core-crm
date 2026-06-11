import { JournalEntryStatus, Prisma } from '@prisma/client';
import { Pagination } from '@shared';
import { JournalEntry } from '../entities/journal-entry.entity';

export const JOURNAL_COMMAND_REPOSITORY = Symbol('IJournalCommandRepository');
export const JOURNAL_QUERY_REPOSITORY = Symbol('IJournalQueryRepository');

export interface FindJournalEntriesFilter {
  organizationId: string;
  status?: JournalEntryStatus;
  periodId?: string;
}

/** Mizan filtresi — şube (defter) bazlı, opsiyonel tarih aralığı. */
export interface TrialBalanceFilter {
  clinicId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/** Hesap bazında ham borç/alacak toplamı (yalnızca POSTED fiş satırları). */
export interface TrialBalanceRow {
  accountId: string;
  totalDebit: Prisma.Decimal;
  totalCredit: Prisma.Decimal;
}

export interface IJournalCommandRepository {
  /** Fişi satırlarıyla birlikte yazar. */
  save(entry: JournalEntry): Promise<JournalEntry>;

  /** Şube (defter) + dönem için bir sonraki boşluksuz fiş numarası. */
  nextEntryNo(clinicId: string, periodId: string): Promise<bigint>;
}

export interface IJournalQueryRepository {
  findById(id: string): Promise<JournalEntry | null>;
  findByEventId(eventId: string): Promise<JournalEntry | null>;
  findMany(
    filter: FindJournalEntriesFilter,
    pagination: Pagination
  ): Promise<{ items: JournalEntry[]; total: number }>;

  /** Mizan: hesap bazında borç/alacak toplamı (POSTED fiş satırları). */
  trialBalance(filter: TrialBalanceFilter): Promise<TrialBalanceRow[]>;
}
