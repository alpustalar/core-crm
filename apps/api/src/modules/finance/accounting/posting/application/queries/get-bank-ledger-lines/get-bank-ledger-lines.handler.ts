import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetBankLedgerLinesQuery } from './get-bank-ledger-lines.query';
import { GetBankLedgerLinesResponse } from './get-bank-ledger-lines.response';

/** TDHP 102 = Bankalar. Mutabakat yalnız bu hesabın hareketleriyle yapılır. */
const BANK_CODE_PREFIX = '102';

@QueryHandler(GetBankLedgerLinesQuery)
export class GetBankLedgerLinesHandler implements IQueryHandler<
  GetBankLedgerLinesQuery,
  GetBankLedgerLinesResponse
> {
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetBankLedgerLinesQuery
  ): Promise<GetBankLedgerLinesResponse> {
    const { clinicId, dateFrom, dateTo, ctx } = query.payload;

    // Hesap id'lerini plan'dan çöz — repo kodları bilmez, yalnız id ile çalışır.
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const accountIds = accounts
      .filter((a) => a.isPostable && a.code.startsWith(BANK_CODE_PREFIX))
      .map((a) => a.id);

    const rows = await this.journalQueryRepo.bankLedgerLines({
      clinicId,
      accountIds,
      dateFrom,
      dateTo,
    });

    return {
      data: rows.map((row) => ({
        lineId: row.lineId,
        entryId: row.entryId,
        entryNo: row.entryNo !== null ? row.entryNo.toString() : null,
        entryDate: row.entryDate,
        entryDescription: row.entryDescription,
        lineDesc: row.lineDesc,
        debit: row.debit.toString(),
        credit: row.credit.toString(),
      })),
    };
  }
}
