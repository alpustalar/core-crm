import { JournalEntryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  TrialBalanceFilter,
  TrialBalanceRow,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';

type JournalDb = PrismaService | Prisma.TransactionClient;

/**
 * Mizan sorgusu tek yerde: raporlama (Query Repo) ve yıl sonu kapanış fişi
 * (Command Repo) aynı toplamı görmek zorunda — iki ayrı kopya zamanla ayrışırdı.
 */
export async function queryTrialBalance(
  db: JournalDb,
  filter: TrialBalanceFilter
): Promise<TrialBalanceRow[]> {
  const entryWhere: Prisma.JournalEntryWhereInput = {
    clinicId: filter.clinicId,
    status: JournalEntryStatus.POSTED,
  };
  if (filter.dateFrom || filter.dateTo) {
    entryWhere.entryDate = { gte: filter.dateFrom, lte: filter.dateTo };
  }

  const grouped = await db.journalLine.groupBy({
    by: ['accountId'],
    where: { entry: entryWhere },
    _sum: { debit: true, credit: true },
  });

  return grouped.map((row) => ({
    accountId: row.accountId,
    totalDebit: row._sum.debit ?? new Prisma.Decimal(0),
    totalCredit: row._sum.credit ?? new Prisma.Decimal(0),
  }));
}
