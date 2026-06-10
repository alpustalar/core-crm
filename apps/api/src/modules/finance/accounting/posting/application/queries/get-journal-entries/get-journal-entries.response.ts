import { QueryResponse } from '@shared/common/response/response.interface';
import { JournalEntry } from '@modules/finance/accounting/posting/domain/entities/journal-entry.entity';

export type GetJournalEntriesResponse = QueryResponse<JournalEntry[]>;
