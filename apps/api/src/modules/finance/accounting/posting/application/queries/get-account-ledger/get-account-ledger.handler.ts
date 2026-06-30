import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AccountSideSchema } from '@input-type-schemas/AccountSideSchema';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetClinicCurrencyQuery } from '@modules/organization/clinic/application/queries/get-clinic-currency/get-clinic-currency.query';
import { AccountCode } from '@modules/finance/accounting/chart-of-accounts/domain/value-objects/account-code.vo';
import { AccountNotFoundInChartException } from '@modules/finance/accounting/chart-of-accounts/domain/exceptions/chart-of-accounts.exceptions';
import {
  AccountLedgerCalculator,
  LedgerLine,
} from '@modules/finance/accounting/posting/domain/reporting/account-ledger.calculator';
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

    // Hesap şubenin planından çözülür (kod → id/ad/yön)
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const targetAccountCode = AccountCode.create(accountCode);
    const account = accounts.find((a) =>
      AccountCode.create(a.code).equals(targetAccountCode)
    );
    if (!account) {
      throw new AccountNotFoundInChartException(accountCode);
    }

    // Defter para birimi — rapor tek fonksiyonel para cinsinden ifade edilir.
    const { data: currency } = await this.queryBus.execute(
      new GetClinicCurrencyQuery(clinicId)
    );

    const ledger = await this.journalQueryRepo.accountLedger({
      clinicId,
      accountId: account.id,
      dateFrom,
      dateTo,
    });

    // Yürüyen bakiye + borç/alacak toplamları
    const isDebitNormal = account.normalSide === AccountSideSchema.enum.DEBIT;
    const { lines, totalDebit, totalCredit, closingBalance } =
      AccountLedgerCalculator.compute(ledger, isDebitNormal);

    return {
      data: {
        clinicId,
        currency,
        account: {
          id: account.id,
          code: targetAccountCode,
          name: account.name,
          normalSide: account.normalSide,
        },
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        openingBalance: ledger.openingBalance.toFixed(2),
        movements: lines.map((line) => this.toMovement(line)),
        totalDebit: totalDebit.toFixed(2),
        totalCredit: totalCredit.toFixed(2),
        closingBalance: closingBalance.toFixed(2),
      },
    };
  }

  private toMovement({ row, runningBalance }: LedgerLine): LedgerMovement {
    return {
      entryId: row.entryId,
      entryNo: row.entryNo !== null ? row.entryNo.toString() : null,
      entryDate: row.entryDate,
      description: row.description,
      lineDesc: row.lineDesc,
      debit: row.debit.toFixed(2),
      credit: row.credit.toFixed(2),
      runningBalance: runningBalance.toFixed(2),
    };
  }
}
