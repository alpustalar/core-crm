import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
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
import { AccountCode } from '@modules/finance/accounting/chart-of-accounts/domain/value-objects/account-code.vo';

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
    const targetAccountCode = AccountCode.create(accountCode);
    const account = accounts.find((a) => a.code.equals(targetAccountCode));
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

    let running = new Decimal(openingBalance.toString());
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);
    const isDebitNormal = account.isDebitNormal();

    const mapped: LedgerMovement[] = [];
    for (const row of movements) {
      const debit = new Decimal(row.debit.toString());
      const credit = new Decimal(row.credit.toString());
      running = isDebitNormal
        ? running.plus(debit).minus(credit)
        : running.plus(credit).minus(debit);
      totalDebit = totalDebit.plus(debit);
      totalCredit = totalCredit.plus(credit);
      mapped.push(this.toMovement(row, running));
    }

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

  private toMovement(row: LedgerMovementRow, running: Decimal): LedgerMovement {
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
