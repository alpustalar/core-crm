import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ACCOUNTING_EVENTS } from '@src/domain/constants/events';
import { DateTimeManager } from '@common/utils';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
  VatDeclaration,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import { GetVatDeclarationQuery } from './get-vat-declaration.query';
import {
  GetVatDeclarationResponse,
  VatDeclarationMonth,
} from './get-vat-declaration.response';

/** TDHP 391 Hesaplanan KDV (çıktı), 191 İndirilecek KDV (girdi). Alt hesaplar dahil. */
const OUTPUT_VAT_PREFIX = '391';
const INPUT_VAT_PREFIX = '191';

@QueryHandler(GetVatDeclarationQuery)
export class GetVatDeclarationHandler implements IQueryHandler<
  GetVatDeclarationQuery,
  GetVatDeclarationResponse
> {
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetVatDeclarationQuery
  ): Promise<GetVatDeclarationResponse> {
    const { clinicId, ctx, dateFrom, dateTo } = query.payload;

    const { evaluator, policy } = this.policyFactory.finance(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check(
        (p) => p.canAccessClinicFinances(clinicId),
        'Bu kliniğin KDV beyanına erişim yetkiniz yok.'
      )
      .orThrow(ACCOUNTING_EVENTS.VAT_DECLARATION);

    const serializationOptions = policy.getSerializationOptions({ clinicId });

    // KDV hesap id'lerini plan'dan çöz (bounded context — QueryBus).
    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(clinicId, ctx)
    );
    const outputAccountIds = accounts
      .filter((a) => a.isPostable && a.code.startsWith(OUTPUT_VAT_PREFIX))
      .map((a) => a.id);
    const inputAccountIds = accounts
      .filter((a) => a.isPostable && a.code.startsWith(INPUT_VAT_PREFIX))
      .map((a) => a.id);

    const declaration = await this.journalQueryRepo.vatDeclaration({
      clinicId,
      outputAccountIds,
      inputAccountIds,
      dateFrom,
      dateTo,
    });

    const { months, outputVat, inputVat } = this.aggregate(declaration);
    const netVat = outputVat.minus(inputVat);
    const payableVat = netVat.greaterThan(0) ? netVat : new Decimal(0);
    const carryForwardVat = netVat.lessThan(0)
      ? netVat.negated()
      : new Decimal(0);

    return {
      data: {
        clinicId,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        outputVat: outputVat.toFixed(2),
        inputVat: inputVat.toFixed(2),
        netVat: netVat.toFixed(2),
        payableVat: payableVat.toFixed(2),
        carryForwardVat: carryForwardVat.toFixed(2),
        months,
      },
      meta: { serializationOptions },
    };
  }

  /**
   * 391/191 ham hareketlerini aya göre kovalar. Hesaplanan KDV = alacak − borç
   * (391 pasif), İndirilecek KDV = borç − alacak (191 aktif).
   */
  private aggregate(declaration: VatDeclaration) {
    const zero = new Decimal(0);
    const buckets = new Map<string, { output: Decimal; input: Decimal }>();
    let totalOutput = zero;
    let totalInput = zero;

    for (const movement of declaration.output) {
      const value = new Decimal(movement.credit.toString()).minus(
        movement.debit.toString()
      );
      const key = DateTimeManager.toMonthKey(movement.entryDate);
      const bucket = buckets.get(key) ?? { output: zero, input: zero };
      bucket.output = bucket.output.plus(value);
      buckets.set(key, bucket);
      totalOutput = totalOutput.plus(value);
    }

    for (const movement of declaration.input) {
      const value = new Decimal(movement.debit.toString()).minus(
        movement.credit.toString()
      );
      const key = DateTimeManager.toMonthKey(movement.entryDate);
      const bucket = buckets.get(key) ?? { output: zero, input: zero };
      bucket.input = bucket.input.plus(value);
      buckets.set(key, bucket);
      totalInput = totalInput.plus(value);
    }

    const months: VatDeclarationMonth[] = [...buckets.keys()]
      .sort()
      .map((month) => {
        const bucket = buckets.get(month)!;
        return {
          month,
          outputVat: bucket.output.toFixed(2),
          inputVat: bucket.input.toFixed(2),
          net: bucket.output.minus(bucket.input).toFixed(2),
        };
      });

    return { months, outputVat: totalOutput, inputVat: totalInput };
  }
}
