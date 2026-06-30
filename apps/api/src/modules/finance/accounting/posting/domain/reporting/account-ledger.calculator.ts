import { Decimal } from 'decimal.js';
import {
  AccountLedger,
  LedgerMovementRow,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';

/** Tek kebir satırı + o satıra kadar oluşan işaretli yürüyen bakiye. */
export interface LedgerLine {
  row: LedgerMovementRow;
  runningBalance: Decimal;
}

export interface AccountLedgerResult {
  lines: LedgerLine[];
  totalDebit: Decimal;
  totalCredit: Decimal;
  closingBalance: Decimal;
}

/**
 * Defter-i Kebir hesaplayıcısı (saf domain). Açılış bakiyesinden başlayıp her
 * fiş satırında yürüyen bakiyeyi ve borç/alacak toplamlarını üretir.
 *
 * Bakiye yönü hesabın karakterine göre belirlenir: borç karakterli hesapta
 * (isDebitNormal) bakiye = +borç −alacak; alacak karakterli hesapta
 * = +alacak −borç. Kapanış bakiyesi son satırdaki yürüyen bakiyedir; hiç
 * hareket yoksa açılış bakiyesine eşittir.
 */
export class AccountLedgerCalculator {
  static compute(
    ledger: AccountLedger,
    isDebitNormal: boolean
  ): AccountLedgerResult {
    let running = new Decimal(ledger.openingBalance.toString());
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    const lines: LedgerLine[] = ledger.movements.map((row) => {
      const debit = new Decimal(row.debit.toString());
      const credit = new Decimal(row.credit.toString());

      running = isDebitNormal
        ? running.plus(debit).minus(credit)
        : running.plus(credit).minus(debit);

      totalDebit = totalDebit.plus(debit);
      totalCredit = totalCredit.plus(credit);

      return { row, runningBalance: running };
    });

    return {
      lines,
      totalDebit,
      totalCredit,
      closingBalance: running,
    };
  }
}
