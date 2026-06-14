import { JournalEntryStatus } from '@prisma/client';
import { QueryResponse } from '@shared/common/response/response.interface';

/** Yevmiye fiş satırı — hesap kodu/adı ile (tutarlar string). */
export interface JournalReportLine {
  accountId: string;
  code: string;
  name: string;
  partyId: string | null;
  debit: string;
  credit: string;
  lineDesc: string | null;
}

/** Yevmiye fişi — kronolojik kayıt + satırları + denge toplamları. */
export interface JournalReportEntry {
  id: string;
  entryNo: string | null;
  entryDate: Date;
  description: string | null;
  status: JournalEntryStatus;
  lines: JournalReportLine[];
  totalDebit: string;
  totalCredit: string;
}

export type GetJournalReportResponse = QueryResponse<JournalReportEntry[]>;
