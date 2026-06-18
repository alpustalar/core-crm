import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { DateTimeManager } from '@common/utils';
import {
  CashFlow,
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetCashFlowQuery } from './get-cash-flow.query';
import { CashFlowMonth, GetCashFlowResponse } from './get-cash-flow.response';
import { Decimal } from 'decimal.js';

/** TDHP "10 Hazır Değerler" grubu = nakit ve nakit benzerleri (kasa/banka/POS). */
const CASH_CODE_PREFIX = '10';

@QueryHandler(GetCashFlowQuery)
export class GetCashFlowHandler
  implements IQueryHandler<GetCashFlowQuery, GetCashFlowResponse>
{
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(query: GetCashFlowQuery): Promise<GetCashFlowResponse> {
    const { clinicId, ctx, dateFrom, dateTo } = query;

    // Nakit hesap id'lerini plan'dan çöz (bounded context — QueryBus).
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const accountIds = accounts
      .filter((a) => a.isPostable && a.code.value.startsWith(CASH_CODE_PREFIX))
      .map((a) => a.id);

    const cashFlow = await this.journalQueryRepo.cashFlow({
      clinicId,
      accountIds,
      dateFrom,
      dateTo,
    });

    const { months, totals, closingBalance } = this.aggregate(cashFlow);

    return {
      data: {
        clinicId,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        openingBalance: new Decimal(cashFlow.openingBalance.toString()).toFixed(2),
        closingBalance: closingBalance.toFixed(2),
        months,
        totals,
      },
    };
  }

  /** Ham hareketleri aya göre kovalar; yürüyen kapanış bakiyesini hesaplar. */
  private aggregate(cashFlow: CashFlow) {
    const zero = new Decimal(0);
    const buckets = new Map<string, { inflow: Decimal; outflow: Decimal }>();
    let totalInflow = zero;
    let totalOutflow = zero;

    // Tek döngüde hem aylık kovalara hem toplam giriş/çıkışa yaz.
    for (const movement of cashFlow.movements) {
      const debit = new Decimal(movement.debit.toString());
      const credit = new Decimal(movement.credit.toString());
      const key = DateTimeManager.toMonthKey(movement.entryDate);
      const bucket = buckets.get(key) ?? { inflow: zero, outflow: zero };
      bucket.inflow = bucket.inflow.plus(debit);
      bucket.outflow = bucket.outflow.plus(credit);
      buckets.set(key, bucket);
      totalInflow = totalInflow.plus(debit);
      totalOutflow = totalOutflow.plus(credit);
    }

    // openingBalance her zaman garantili Decimal — hareket olmasa bile kapanış açılışa eşittir.
    let running = new Decimal(cashFlow.openingBalance.toString());
    const months: CashFlowMonth[] = [...buckets.keys()].sort().map((month) => {
      const bucket = buckets.get(month)!;
      const net = bucket.inflow.minus(bucket.outflow);
      running = running.plus(net);
      return {
        month,
        inflow: bucket.inflow.toFixed(2),
        outflow: bucket.outflow.toFixed(2),
        net: net.toFixed(2),
        closingBalance: running.toFixed(2),
      };
    });

    return {
      months,
      totals: {
        inflow: totalInflow.toFixed(2),
        outflow: totalOutflow.toFixed(2),
        net: totalInflow.minus(totalOutflow).toFixed(2),
      },
      closingBalance: running,
    };
  }
}
