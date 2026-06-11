import { AccountSide } from '@prisma/client';
import { QueryResponse } from '@shared/common/response/response.interface';

export interface LedgerAccountHeader {
  id: string;
  code: string;
  name: string;
  normalSide: AccountSide; // bakiye yönü yorumu için
}

/** Defter-i Kebir hareketi — tek fiş satırı + yürüyen bakiye (tutarlar string). */
export interface LedgerMovement {
  entryId: string;
  entryNo: string | null;
  entryDate: Date;
  description: string | null;
  lineDesc: string | null;
  debit: string;
  credit: string;
  runningBalance: string; // işaretli kümülatif (borç +, alacak -)
}

export interface AccountLedgerReport {
  clinicId: string;
  account: LedgerAccountHeader;
  dateFrom: Date | null;
  dateTo: Date | null;
  openingBalance: string;
  movements: LedgerMovement[];
  totalDebit: string;
  totalCredit: string;
  closingBalance: string;
}

export type GetAccountLedgerResponse = QueryResponse<AccountLedgerReport>;
