import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { Decimal } from 'decimal.js';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
  JournalReportRow,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { JournalEntrySequence } from '@modules/finance/shared/domain/value-objects/journal-entry-sequence.vo';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetJournalReportQuery } from './get-journal-report.query';
import {
  GetJournalReportResponse,
  JournalReportEntry,
} from './get-journal-report.response';
import { Account } from '@shared';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ACCOUNTING_EVENTS } from '@src/domain/constants/events';

@QueryHandler(GetJournalReportQuery)
export class GetJournalReportHandler implements IQueryHandler<
  GetJournalReportQuery,
  GetJournalReportResponse
> {
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetJournalReportQuery
  ): Promise<GetJournalReportResponse> {
    const { clinicId, pagination, ctx, dateFrom, dateTo } = query.payload;

    const { evaluator, policy } = this.policyFactory.finance(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check(
        (p) => p.canAccessClinicFinances(clinicId),
        'Bu kliniğin yevmiye defterine erişim yetkiniz yok.'
      )
      .orThrow(ACCOUNTING_EVENTS.JOURNAL_REPORT);

    const serializationOptions = policy.getSerializationOptions({ clinicId });

    const { items, total } = await this.journalQueryRepo.journalReport(
      { clinicId, dateFrom, dateTo },
      pagination
    );

    // Hesap kod/adı şubenin planından — bounded context (QueryBus).
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const accountById = new Map<string, Account>(
      accounts.map((account) => [account.id, account])
    );

    return {
      data: items.map((entry) => this.toEntry(entry, accountById)),
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions,
      },
    };
  }

  private toEntry(
    entry: JournalReportRow,
    accountById: Map<string, Account>
  ): JournalReportEntry {
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    const lines = entry.lines.map((line) => {
      const account = accountById.get(line.accountId);
      totalDebit = totalDebit.plus(line.debit.toString());
      totalCredit = totalCredit.plus(line.credit.toString());

      return {
        accountId: line.accountId,
        code: account?.code ?? '?',
        name: account?.name ?? '(bilinmeyen hesap)',
        partyId: line.partyId,
        debit: line.debit.toFixed(2),
        credit: line.credit.toFixed(2),
        lineDesc: line.lineDesc,
      };
    });

    return {
      id: entry.id,
      // Fiş numarası biçimi (min-3 hane) VO'nun kuralı — entity kurmadan da aynısı.
      entryNo:
        entry.entryNo === null
          ? null
          : JournalEntrySequence.fromSequence(entry.entryNo).value,
      entryDate: entry.entryDate,
      description: entry.description,
      status: entry.status,
      lines,
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2),
    };
  }
}
