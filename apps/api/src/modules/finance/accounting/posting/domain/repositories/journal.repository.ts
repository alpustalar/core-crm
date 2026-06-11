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

/** Defter-i Kebir filtresi — bir hesabın şube bazlı hareketleri. */
export interface AccountLedgerFilter {
  clinicId: string;
  accountId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/** Bir hesabın tek fiş satırı hareketi (kebir dökümü için). */
export interface LedgerMovementRow {
  entryId: string;
  entryNo: bigint | null;
  entryDate: Date;
  description: string | null; // fiş açıklaması
  lineDesc: string | null; // satır açıklaması
  debit: Prisma.Decimal;
  credit: Prisma.Decimal;
}

export interface AccountLedger {
  openingBalance: Prisma.Decimal; // dateFrom öncesi devir (yoksa 0)
  movements: LedgerMovementRow[]; // entryDate, entryNo sırasında
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

  /** Defter-i Kebir: bir hesabın sıralı hareketleri + açılış devri. */
  accountLedger(filter: AccountLedgerFilter): Promise<AccountLedger>;
}
