import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';

import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
  TrialBalanceRow,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { GetTrialBalanceQuery } from './get-trial-balance.query';
import {
  GetTrialBalanceResponse,
  TrialBalanceLine,
} from './get-trial-balance.response';
import { Account } from '@shared';

/** Prisma.Decimal → decimal.js dönüşümü bir kez yapılır; toLine ve sumTotals bu tip üzerinden çalışır. */
interface NormalizedRow {
  accountId: string;
  debit: Decimal;
  credit: Decimal;
}

@QueryHandler(GetTrialBalanceQuery)
export class GetTrialBalanceHandler
  implements IQueryHandler<GetTrialBalanceQuery, GetTrialBalanceResponse>
{
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(query: GetTrialBalanceQuery): Promise<GetTrialBalanceResponse> {
    const { clinicId, ctx, dateFrom, dateTo } = query;

    const rows = await this.journalQueryRepo.trialBalance({
      clinicId,
      dateFrom,
      dateTo,
    });

    // Prisma.Decimal → decimal.js: her satır için tek seferlik dönüşüm.
    const normalized = this.normalize(rows);

    // Hesap meta verisi (kod/ad) chart-of-accounts'tan — bounded context (QueryBus).
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const accountById = new Map<string, Account>(
      accounts.map((account) => [account.id, account])
    );

    const lines = normalized
      .map((row) => this.toLine(row, accountById))
      .sort((a, b) => a.code.localeCompare(b.code));

    const totals = this.sumTotals(normalized);

    return {
      data: {
        clinicId,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        lines,
        totals: {
          totalDebit: totals.totalDebit.toFixed(2),
          totalCredit: totals.totalCredit.toFixed(2),
          debitBalance: totals.debitBalance.toFixed(2),
          creditBalance: totals.creditBalance.toFixed(2),
        },
        isBalanced:
          totals.totalDebit.equals(totals.totalCredit) &&
          totals.debitBalance.equals(totals.creditBalance),
      },
    };
  }

  private normalize(rows: TrialBalanceRow[]): NormalizedRow[] {
    return rows.map((row) => ({
      accountId: row.accountId,
      debit: new Decimal(row.totalDebit.toString()),
      credit: new Decimal(row.totalCredit.toString()),
    }));
  }

  private toLine(
    row: NormalizedRow,
    accountById: Map<string, Account>
  ): TrialBalanceLine {
    const account = accountById.get(row.accountId);
    const balance = row.debit.minus(row.credit);
    return {
      accountId: row.accountId,
      code: account?.code ?? '?',
      name: account?.name ?? '(bilinmeyen hesap)',
      totalDebit: row.debit.toFixed(2),
      totalCredit: row.credit.toFixed(2),
      debitBalance: balance.gt(0) ? balance.toFixed(2) : '0.00',
      creditBalance: balance.lt(0) ? balance.abs().toFixed(2) : '0.00',
    };
  }

  private sumTotals(rows: NormalizedRow[]) {
    const zero = new Decimal(0);
    return rows.reduce(
      (acc, row) => {
        const balance = row.debit.minus(row.credit);
        return {
          totalDebit: acc.totalDebit.plus(row.debit),
          totalCredit: acc.totalCredit.plus(row.credit),
          debitBalance: balance.gt(0)
            ? acc.debitBalance.plus(balance)
            : acc.debitBalance,
          creditBalance: balance.lt(0)
            ? acc.creditBalance.plus(balance.abs())
            : acc.creditBalance,
        };
      },
      {
        totalDebit: zero,
        totalCredit: zero,
        debitBalance: zero,
        creditBalance: zero,
      }
    );
  }
}
