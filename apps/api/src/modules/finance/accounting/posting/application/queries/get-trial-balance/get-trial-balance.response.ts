import { QueryResponse } from '@shared/common/response/response.interface';

/** Mizan satırı — bir hesabın borç/alacak toplamı ve bakiyesi (tutarlar string). */
export interface TrialBalanceLine {
  accountId: string;
  code: string;
  name: string;
  totalDebit: string;
  totalCredit: string;
  debitBalance: string; // borç bakiyesi (toplam borç > toplam alacak)
  creditBalance: string; // alacak bakiyesi (toplam alacak > toplam borç)
}

export interface TrialBalanceTotals {
  totalDebit: string;
  totalCredit: string;
  debitBalance: string;
  creditBalance: string;
}

export interface TrialBalanceReport {
  clinicId: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  lines: TrialBalanceLine[];
  totals: TrialBalanceTotals;
  /** Muhasebe sağlık kontrolü: Σborç = Σalacak. */
  isBalanced: boolean;
}

export type GetTrialBalanceResponse = QueryResponse<TrialBalanceReport>;
