import { QueryResponse } from '@shared/common/response/response.interface';
import { JournalEntry } from '@shared';

export type GetJournalEntriesResponse = QueryResponse<JournalEntry[]>;
