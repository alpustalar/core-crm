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
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetIncomeStatementQuery } from './get-income-statement.query';
import {
  GetIncomeStatementResponse,
  IncomeStatementReportSection,
} from './get-income-statement.response';
import { Account } from '@shared';

@QueryHandler(GetIncomeStatementQuery)
export class GetIncomeStatementHandler implements IQueryHandler<
  GetIncomeStatementQuery,
  GetIncomeStatementResponse
> {
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetIncomeStatementQuery
  ): Promise<GetIncomeStatementResponse> {
    const { clinicId, ctx, dateFrom, dateTo } = query.payload;

    const rows = await this.journalQueryRepo.trialBalance({
      clinicId,
      dateFrom,
      dateTo,
    });

    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const accountById = new Map<string, Account>(
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

    const r = IncomeStatementCalculator.compute(balances);

    return {
      data: {
        clinicId,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        grossSales: this.toSection(r.grossSales),
        salesDeductions: this.toSection(r.salesDeductions),
        netSales: r.netSales.toFixed(2),
        costOfSales: this.toSection(r.costOfSales),
        grossProfit: r.grossProfit.toFixed(2),
        operatingExpenses: this.toSection(r.operatingExpenses),
        operatingProfit: r.operatingProfit.toFixed(2),
        otherIncome: this.toSection(r.otherIncome),
        otherExpense: this.toSection(r.otherExpense),
        netProfit: r.netProfit.toFixed(2),
      },
    };
  }

  private toSection(
    section: IncomeStatementSection
  ): IncomeStatementReportSection {
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
