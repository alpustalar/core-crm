import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
  TrialBalanceRow,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';
import { GetTrialBalanceQuery } from './get-trial-balance.query';
import {
  GetTrialBalanceResponse,
  TrialBalanceLine,
} from './get-trial-balance.response';

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

    // Hesap meta verisi (kod/ad) chart-of-accounts'tan — bounded context (QueryBus).
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const accountById = new Map<string, Account>(
      accounts.map((account) => [account.id, account])
    );

    const lines = rows
      .map((row) => this.toLine(row, accountById))
      .sort((a, b) => a.code.localeCompare(b.code));

    const totals = this.sumTotals(rows);

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
        isBalanced: totals.totalDebit.equals(totals.totalCredit),
      },
    };
  }

  private toLine(
    row: TrialBalanceRow,
    accountById: Map<string, Account>
  ): TrialBalanceLine {
    const account = accountById.get(row.accountId);
    const balance = row.totalDebit.minus(row.totalCredit);
    return {
      accountId: row.accountId,
      code: account?.code ?? '?',
      name: account?.name ?? '(bilinmeyen hesap)',
      totalDebit: row.totalDebit.toFixed(2),
      totalCredit: row.totalCredit.toFixed(2),
      debitBalance: balance.gt(0) ? balance.toFixed(2) : '0.00',
      creditBalance: balance.lt(0) ? balance.abs().toFixed(2) : '0.00',
    };
  }

  private sumTotals(rows: TrialBalanceRow[]) {
    const zero = new Prisma.Decimal(0);
    return rows.reduce(
      (acc, row) => {
        const balance = row.totalDebit.minus(row.totalCredit);
        return {
          totalDebit: acc.totalDebit.plus(row.totalDebit),
          totalCredit: acc.totalCredit.plus(row.totalCredit),
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
