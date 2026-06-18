/**
 * Storno (ters kayıt) taslağı üretmek için gereken veriler. Storno yeni bir fiştir;
 * kendi dönemine + numara akışına girer, eventId taşımaz (FinancialEvent'e bağlı değil).
 */
export interface BuildReversalDraftProps {
  reversalId: string;
  periodId: string;
  entryDate: Date;
  description?: string | null;
  performedById?: string | null;
}
