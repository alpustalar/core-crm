import { Decimal } from 'decimal.js';

export interface CreateJournalEntryLineProps {
  id?: string;
  accountId: string;
  partyId?: string | null; // Cari, personel veya alt kırılım ID'si

  debit?: string | Decimal;
  credit?: string | Decimal;

  // currency = satırın fonksiyonel (defter) para birimi. debit/credit bu cinstendir.
  currency?: string;

  // Yabancı para izlenebilirliği — yalnız çevrilmiş satırlarda dolu (Model A).
  // original* = işlemin orijinal para birimindeki tutarı; fxRate = orijinal→fonksiyonel kuru.
  originalDebit?: string | Decimal | null;
  originalCredit?: string | Decimal | null;
  originalCurrency?: string | null;
  fxRate?: string | Decimal | null;

  lineDesc?: string | null;
}
