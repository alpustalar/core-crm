import { CreateJournalEntryLineProps } from '@modules/finance/accounting/posting/domain/contracts/journal-line';

export interface CreateJournalEntryProps {
  id?: string;
  clinicId: string; // defter sahibi şube (source-of-truth)
  organizationId: string; // denormalize — konsolide raporlama
  periodId: string; // İlgili mali dönem ID'si
  entryDate: Date;
  description?: string | null;
  eventId?: string | null;
  performedById?: string | null;

  // Alt satırlar dizisi. En az 2 satır zorunludur — JournalLines VO'da doğrulanır.
  lines: CreateJournalEntryLineProps[];
}

/**
 * Storno (ters kayıt) taslağı üretmek için gereken veriler. Storno yeni bir fiştir;
 * kendi dönemine + numara akışına girer, eventId taşımaz.
 */
export interface BuildReversalDraftProps {
  reversalId: string;
  periodId: string;
  entryDate: Date;
  description?: string | null;
  performedById?: string | null;
}
