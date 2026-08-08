import { QueryResponse } from '@shared/common/response/response.interface';

/**
 * Tek banka defteri hareketi. Tutarlar string (Decimal serileştirmesi);
 * tüketen taraf (banka mutabakatı) kendi Decimal'ine çevirir.
 */
export interface BankLedgerLineView {
  /** JournalLine.id — mutabakatta `matchedRef` olarak kullanılır. */
  lineId: string;
  entryId: string;
  entryNo: string | null;
  entryDate: Date;
  entryDescription: string | null;
  lineDesc: string | null;
  /** Bankaya giriş. */
  debit: string;
  /** Bankadan çıkış. */
  credit: string;
}

export type GetBankLedgerLinesResponse = QueryResponse<BankLedgerLineView[]>;
