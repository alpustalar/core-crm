import { Decimal } from 'decimal.js';

export interface CreateJournalEntryLineInput {
  accountId: string;
  partyId?: string | null;
  debit?: string | Decimal;
  credit?: string | Decimal;
  currency?: string;
  lineDesc?: string | null;
}

export interface CreateJournalEntryProps {
  id?: string;
  clinicId: string; // defter sahibi şube (source-of-truth)
  organizationId: string; // denormalize — konsolide raporlama
  periodId: string;
  entryDate: Date;
  description?: string | null;
  eventId?: string | null;
  performedById?: string | null;
  lines: CreateJournalEntryLineInput[];
}
