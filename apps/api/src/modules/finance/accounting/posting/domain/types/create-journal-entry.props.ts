import { Prisma } from '@prisma/client';

export interface CreateJournalEntryLineInput {
  accountId: string;
  partyId?: string | null;
  debit?: string | Prisma.Decimal;
  credit?: string | Prisma.Decimal;
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
