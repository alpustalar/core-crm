import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import {
  AccountBalanceInput,
  IncomeStatementCalculator,
  IncomeStatementSection,
} from '@modules/finance/accounting/posting/domain/reporting/income-statement.calculator';
import { BalanceSheetCalculator } from '@modules/finance/accounting/posting/domain/reporting/balance-sheet.calculator';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetBalanceSheetQuery } from './get-balance-sheet.query';
import {
  BalanceSheetReportSection,
  GetBalanceSheetResponse,
} from './get-balance-sheet.response';

@QueryHandler(GetBalanceSheetQuery)
export class GetBalanceSheetHandler
  implements IQueryHandler<GetBalanceSheetQuery, GetBalanceSheetResponse>
{
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(query: GetBalanceSheetQuery): Promise<GetBalanceSheetResponse> {
    const { clinicId, ctx, dateFrom, dateTo } = query.payload;

    const rows = await this.journalQueryRepo.trialBalance({
      clinicId,
      dateFrom,
      dateTo,
    });
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );

    const accountById = new Map<string, (typeof accounts)[number]>(
      accounts.map((account) => [account.id, account])
    );

    const balances: AccountBalanceInput[] = rows.map((row) => {
      const account = accountById.get(row.accountId);

      return {
        code: account?.code ?? '?',
        name: account?.name ?? '(bilinmeyen hesap)',
        debit: row.totalDebit,
        credit: row.totalCredit,
      };
    });

    // Dönem sonucu gelir tablosundan; bilançoyu dengeleyen öz kaynak kalemi.
    const { netProfit } = IncomeStatementCalculator.compute(balances);
    const r = BalanceSheetCalculator.compute(balances, netProfit);

    return {
      data: {
        clinicId,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        currentAssets: this.toSection(r.currentAssets),
        nonCurrentAssets: this.toSection(r.nonCurrentAssets),
        totalAssets: r.totalAssets.toFixed(2),
        shortTermLiabilities: this.toSection(r.shortTermLiabilities),
        longTermLiabilities: this.toSection(r.longTermLiabilities),
        equity: this.toSection(r.equity),
        periodResult: r.periodResult.toFixed(2),
        totalLiabilitiesAndEquity: r.totalLiabilitiesAndEquity.toFixed(2),
        isBalanced: r.isBalanced,
      },
    };
  }

  private toSection(
    section: IncomeStatementSection
  ): BalanceSheetReportSection {
    return {
      total: section.total.toFixed(2),
      lines: section.lines.map((line) => ({
        code: line.code,
        name: line.name,
        amount: line.amount.toFixed(2),
      })),
    };
  }
}
