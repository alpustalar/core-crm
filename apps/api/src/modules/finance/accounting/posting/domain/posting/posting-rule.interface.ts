import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';
import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';

/** Bir kuralın ürettiği ham fiş taslağı — hesaplar henüz kod (id değil). */
export interface DraftJournalLine {
  accountCode: string; // '120', '600.04', '391'...
  partyId?: string | null; // 120/320 için zorunlu
  debit?: string;
  credit?: string;
  desc?: string;
}

export interface DraftJournalEntry {
  date: Date;
  description: string;
  lines: DraftJournalLine[];
}

export interface PostingContext {
  clinicId: string;
  organizationId: string;
}

/**
 * Bir FinancialEvent'i çift taraflı fiş taslağına çeviren saf fonksiyon.
 * Aynı olay + aynı kural = aynı fiş (deterministik).
 */
export interface PostingRule {
  readonly eventType: FinancialEventType;
  build(event: FinancialEvent, ctx: PostingContext): DraftJournalEntry;
}

export const POSTING_RULES = Symbol('POSTING_RULES');
