import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
  LedgerMovementRow,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetAccountLedgerQuery } from './get-account-ledger.query';
import {
  GetAccountLedgerResponse,
  LedgerMovement,
} from './get-account-ledger.response';

@QueryHandler(GetAccountLedgerQuery)
export class GetAccountLedgerHandler
  implements IQueryHandler<GetAccountLedgerQuery, GetAccountLedgerResponse>
{
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetAccountLedgerQuery
  ): Promise<GetAccountLedgerResponse> {
    const { clinicId, accountCode, ctx, dateFrom, dateTo } = query;

    // Hesabı şubenin planından çöz (kod → id/ad/yön) — bounded context (QueryBus).
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const account = accounts.find((a) => a.code === accountCode);
    if (!account) {
      throw new NotFoundException(
        `Hesap planında kod bulunamadı: ${accountCode}`
      );
    }

    const { openingBalance, movements } =
      await this.journalQueryRepo.accountLedger({
        clinicId,
        accountId: account.id,
        dateFrom,
        dateTo,
      });

    let running = openingBalance;
    let totalDebit = new Prisma.Decimal(0);
    let totalCredit = new Prisma.Decimal(0);

    const mapped: LedgerMovement[] = movements.map((row) => {
      running = running.plus(row.debit).minus(row.credit);
      totalDebit = totalDebit.plus(row.debit);
      totalCredit = totalCredit.plus(row.credit);
      return this.toMovement(row, running);
    });

    return {
      data: {
        clinicId,
        account: {
          id: account.id,
          code: account.code,
          name: account.name,
          normalSide: account.normalSide,
        },
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        openingBalance: openingBalance.toFixed(2),
        movements: mapped,
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        closingBalance: running.toFixed(2),
      },
    };
  }

  private toMovement(
    row: LedgerMovementRow,
    running: Prisma.Decimal
  ): LedgerMovement {
    return {
      entryId: row.entryId,
      entryNo: row.entryNo !== null ? row.entryNo.toString() : null,
      entryDate: row.entryDate,
      description: row.description,
      lineDesc: row.lineDesc,
      debit: row.debit.toFixed(2),
      credit: row.credit.toFixed(2),
      runningBalance: running.toFixed(2),
    };
  }
}
