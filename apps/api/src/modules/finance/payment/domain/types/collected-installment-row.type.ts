import { Decimal } from 'decimal.js';

/** Tahsil edilmiş tek taksitin hekim boyutu — gruplama için ham veri. */
export interface CollectedInstallmentRow {
  providerId: string | null; // null = ödeme bir hekime atanmamış
  amount: Decimal;
}
