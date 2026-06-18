import { QueryResponse } from '@shared/common/response/response.interface';
import { AccountCode } from '@modules/finance/accounting/chart-of-accounts/domain/value-objects/account-code.vo';
import { AccountSideType } from '@input-type-schemas/AccountSideSchema';

export interface LedgerAccountHeader {
  id: string;
  code: AccountCode;
  name: string;
  normalSide: AccountSideType; // bakiye yönü yorumu için
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
