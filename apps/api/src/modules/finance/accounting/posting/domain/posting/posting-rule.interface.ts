import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { FinancialEvent } from '@shared';

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
  /**
   * İşlemin orijinal para birimi. Belirtilmezse defterin fonksiyonel para birimi
   * varsayılır (çevirme yapılmaz). Yabancı para kuralları bunu event'ten doldurur;
   * posting handler fonksiyonel paraya çevirir (Model A).
   */
  currency?: CurrencyType;
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
