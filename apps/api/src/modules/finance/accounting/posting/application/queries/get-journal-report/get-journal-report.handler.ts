import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { JournalEntry } from '@modules/finance/accounting/posting/domain/entities/journal-entry.entity';
import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetJournalReportQuery } from './get-journal-report.query';
import {
  GetJournalReportResponse,
  JournalReportEntry,
} from './get-journal-report.response';

@QueryHandler(GetJournalReportQuery)
export class GetJournalReportHandler
  implements IQueryHandler<GetJournalReportQuery, GetJournalReportResponse>
{
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetJournalReportQuery
  ): Promise<GetJournalReportResponse> {
    const { clinicId, pagination, ctx, dateFrom, dateTo } = query;

    const { items, total } = await this.journalQueryRepo.journalReport(
      { clinicId, dateFrom, dateTo },
      pagination
    );

    // Hesap kod/ad'ı şubenin planından — bounded context (QueryBus).
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const accountById = new Map<string, Account>(
      accounts.map((account) => [account.id, account])
    );

    return {
      data: items.map((entry) => this.toEntry(entry, accountById)),
      meta: { pagination: buildPaginationMeta(pagination, total) },
    };
  }

  private toEntry(
    entry: JournalEntry,
    accountById: Map<string, Account>
  ): JournalReportEntry {
    return {
      id: entry.id,
      entryNo: entry.entryNo !== null ? entry.entryNo.toString() : null,
      entryDate: entry.entryDate,
      description: entry.description,
      status: entry.status,
      lines: entry.lines.map((line) => {
        const account = accountById.get(line.accountId);
        return {
          accountId: line.accountId,
          code: account?.code ?? '?',
          name: account?.name ?? '(bilinmeyen hesap)',
          partyId: line.partyId,
          debit: line.debit.toFixed(2),
          credit: line.credit.toFixed(2),
          lineDesc: line.lineDesc,
        };
      }),
      totalDebit: entry.totalDebit().toFixed(2),
      totalCredit: entry.totalCredit().toFixed(2),
    };
  }
}
