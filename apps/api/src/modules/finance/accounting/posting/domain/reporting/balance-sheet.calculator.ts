import {
  AccountBalanceInput,
  IncomeStatementLine,
  IncomeStatementSection,
} from './income-statement.calculator';
import { Decimal } from 'decimal.js';

/**
 * Bilanço hesaplayıcısı (saf domain). Hesap bakiyelerinden TDHP bilançosunu
 * üretir (doc 04 §4): Aktif (1+2) = Pasif (3+4) + Öz Kaynaklar (5) + Dönem Net
 * Kârı. Dönem sonucu kapanış öncesi gelir tablosundan gelir (590/591'e devir
 * yapılmamış olsa da bilançonun dengelenmesi için öz kaynağa eklenir).
 *
 * Aktif satırlarında bakiye = borç − alacak (kontra-aktif hesaplar negatif),
 * pasif/öz kaynak satırlarında bakiye = alacak − borç.
 */

export interface BalanceSheetResult {
  currentAssets: IncomeStatementSection; // sınıf 1 — dönen varlıklar
  nonCurrentAssets: IncomeStatementSection; // sınıf 2 — duran varlıklar
  totalAssets: Decimal; // AKTİF

  shortTermLiabilities: IncomeStatementSection; // sınıf 3
  longTermLiabilities: IncomeStatementSection; // sınıf 4
  equity: IncomeStatementSection; // sınıf 5
  periodResult: Decimal; // dönem net kârı/zararı (öz kaynağa eklenir)
  totalLiabilitiesAndEquity: Decimal; // PASİF

  isBalanced: boolean; // Aktif = Pasif
}

type AssetKey = 'currentAssets' | 'nonCurrentAssets';
type CreditKey = 'shortTermLiabilities' | 'longTermLiabilities' | 'equity';
type SectionKey = AssetKey | CreditKey;

export class BalanceSheetCalculator {
  static compute(
    balances: AccountBalanceInput[],
    periodResult: Decimal
  ): BalanceSheetResult {
    const sections: Record<SectionKey, IncomeStatementLine[]> = {
      currentAssets: [],
      nonCurrentAssets: [],
      shortTermLiabilities: [],
      longTermLiabilities: [],
      equity: [],
    };

    for (const balance of balances) {
      const key = this.classify(balance.code);
      if (!key) continue; // gelir tablosu (6/7) + sonuç (9) hesapları hariç

      const isAsset = key === 'currentAssets' || key === 'nonCurrentAssets';
      const amount = isAsset
        ? balance.debit.minus(balance.credit)
        : balance.credit.minus(balance.debit);

      sections[key].push({ code: balance.code, name: balance.name, amount });
    }

    const section = (key: SectionKey): IncomeStatementSection => {
      const lines = sections[key].sort((a, b) => a.code.localeCompare(b.code));
      const total = lines.reduce(
        (sum, line) => sum.plus(line.amount),
        new Decimal(0)
      );
      return { lines, total };
    };

    const currentAssets = section('currentAssets');
    const nonCurrentAssets = section('nonCurrentAssets');
    const totalAssets = currentAssets.total.plus(nonCurrentAssets.total);

    const shortTermLiabilities = section('shortTermLiabilities');
    const longTermLiabilities = section('longTermLiabilities');
    const equity = section('equity');
    const totalLiabilitiesAndEquity = shortTermLiabilities.total
      .plus(longTermLiabilities.total)
      .plus(equity.total)
      .plus(periodResult);

    return {
      currentAssets,
      nonCurrentAssets,
      totalAssets,
      shortTermLiabilities,
      longTermLiabilities,
      equity,
      periodResult,
      totalLiabilitiesAndEquity,
      isBalanced: totalAssets.equals(totalLiabilitiesAndEquity),
    };
  }

  private static classify(code: string): SectionKey | null {
    if (code.startsWith('1')) return 'currentAssets';
    if (code.startsWith('2')) return 'nonCurrentAssets';
    if (code.startsWith('3')) return 'shortTermLiabilities';
    if (code.startsWith('4')) return 'longTermLiabilities';
    if (code.startsWith('5')) return 'equity';
    return null; // 6/7 gelir tablosu, 9 nazım
  }
}
