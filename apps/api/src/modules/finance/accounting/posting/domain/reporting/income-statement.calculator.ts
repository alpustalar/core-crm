import { Prisma } from '@prisma/client';

/**
 * Gelir Tablosu hesaplayıcısı (saf domain). Hesap bakiyelerinden TDHP gelir
 * tablosu yapısını üretir (doc 04 §4):
 *   Net Satış = Brüt Satış − Satış İndirimleri
 *   Brüt Kâr = Net Satış − Satışların Maliyeti
 *   Faaliyet Kârı = Brüt Kâr − Faaliyet Giderleri
 *   Dönem Kârı/Zararı = Faaliyet Kârı + Diğer Gelirler − Diğer Giderler
 */

export interface AccountBalanceInput {
  code: string;
  name: string;
  debit: Prisma.Decimal;
  credit: Prisma.Decimal;
}

export interface IncomeStatementLine {
  code: string;
  name: string;
  amount: Prisma.Decimal; // bölümün doğal yönünde pozitif büyüklük
}

export interface IncomeStatementSection {
  lines: IncomeStatementLine[];
  total: Prisma.Decimal;
}

export interface IncomeStatementResult {
  grossSales: IncomeStatementSection;
  salesDeductions: IncomeStatementSection;
  netSales: Prisma.Decimal;
  costOfSales: IncomeStatementSection;
  grossProfit: Prisma.Decimal;
  operatingExpenses: IncomeStatementSection;
  operatingProfit: Prisma.Decimal;
  otherIncome: IncomeStatementSection;
  otherExpense: IncomeStatementSection;
  netProfit: Prisma.Decimal; // dönem net kârı/zararı
}

type SectionKey =
  | 'grossSales'
  | 'salesDeductions'
  | 'costOfSales'
  | 'operatingExpenses'
  | 'otherIncome'
  | 'otherExpense';

/** Gelir (credit-normal) bölümler; diğerleri gider (debit-normal). */
const CREDIT_NORMAL: ReadonlySet<SectionKey> = new Set([
  'grossSales',
  'otherIncome',
]);

export class IncomeStatementCalculator {
  static compute(balances: AccountBalanceInput[]): IncomeStatementResult {
    const sections: Record<SectionKey, IncomeStatementLine[]> = {
      grossSales: [],
      salesDeductions: [],
      costOfSales: [],
      operatingExpenses: [],
      otherIncome: [],
      otherExpense: [],
    };

    for (const balance of balances) {
      const key = this.classify(balance.code);
      if (!key) continue; // 69x sonuç hesapları + bilanço hesapları hariç

      const amount = CREDIT_NORMAL.has(key)
        ? balance.credit.minus(balance.debit)
        : balance.debit.minus(balance.credit);

      sections[key].push({ code: balance.code, name: balance.name, amount });
    }

    const section = (key: SectionKey): IncomeStatementSection => {
      const lines = sections[key].sort((a, b) => a.code.localeCompare(b.code));
      const total = lines.reduce(
        (sum, line) => sum.plus(line.amount),
        new Prisma.Decimal(0)
      );
      return { lines, total };
    };

    const grossSales = section('grossSales');
    const salesDeductions = section('salesDeductions');
    const netSales = grossSales.total.minus(salesDeductions.total);

    const costOfSales = section('costOfSales');
    const grossProfit = netSales.minus(costOfSales.total);

    const operatingExpenses = section('operatingExpenses');
    const operatingProfit = grossProfit.minus(operatingExpenses.total);

    const otherIncome = section('otherIncome');
    const otherExpense = section('otherExpense');
    const netProfit = operatingProfit
      .plus(otherIncome.total)
      .minus(otherExpense.total);

    return {
      grossSales,
      salesDeductions,
      netSales,
      costOfSales,
      grossProfit,
      operatingExpenses,
      operatingProfit,
      otherIncome,
      otherExpense,
      netProfit,
    };
  }

  /** TDHP kod öneğine göre gelir tablosu bölümü (yoksa null = kapsam dışı). */
  private static classify(code: string): SectionKey | null {
    if (code.startsWith('60')) return 'grossSales'; // 600/601/602
    if (code.startsWith('61')) return 'salesDeductions'; // 610/611/612
    if (code.startsWith('62') || code.startsWith('73') || code.startsWith('74')) {
      return 'costOfSales'; // satışların maliyeti / hizmet üretim maliyeti
    }
    if (
      code.startsWith('63') ||
      code.startsWith('75') ||
      code.startsWith('76') ||
      code.startsWith('77')
    ) {
      return 'operatingExpenses'; // pazarlama + genel yönetim + ar-ge
    }
    if (code.startsWith('64') || code.startsWith('67')) return 'otherIncome';
    if (code.startsWith('65') || code.startsWith('66') || code.startsWith('68')) {
      return 'otherExpense';
    }
    return null; // 690/69x ve bilanço (1-5) hesapları
  }
}
