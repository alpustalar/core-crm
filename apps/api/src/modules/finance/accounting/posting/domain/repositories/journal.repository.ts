import { JournalEntryStatus } from '@prisma/client';
import { Pagination } from '@shared';
import { JournalEntry } from '../entities/journal-entry.entity';

export const JOURNAL_COMMAND_REPOSITORY = Symbol('IJournalCommandRepository');
export const JOURNAL_QUERY_REPOSITORY = Symbol('IJournalQueryRepository');

export interface FindJournalEntriesFilter {
  organizationId: string;
  status?: JournalEntryStatus;
  periodId?: string;
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
}
