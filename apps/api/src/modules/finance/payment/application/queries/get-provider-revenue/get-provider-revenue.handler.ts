import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProviderRevenueQuery } from './get-provider-revenue.query';
import {
  GetProviderRevenueResponse,
  ProviderRevenueLine,
} from './get-provider-revenue.response';
import { Decimal } from 'decimal.js';
import {
  IPaymentQueryRepository,
  PAYMENT_QUERY_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment/payment.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

/** providerId null grubu için sabit anahtar (Map key olarak kullanılır). */
const UNASSIGNED = '__unassigned__';

@QueryHandler(GetProviderRevenueQuery)
export class GetProviderRevenueHandler
  implements IQueryHandler<GetProviderRevenueQuery, GetProviderRevenueResponse>
{
  constructor(
    @Inject(PAYMENT_QUERY_REPOSITORY)
    private readonly paymentQueryRepo: IPaymentQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetProviderRevenueQuery
  ): Promise<GetProviderRevenueResponse> {
    const { clinicId, dateFrom, dateTo, ctx } = query;

    const { evaluator, policy } = this.policyFactory.finance(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check(
        (p) => p.canAccessClinicFinances(clinicId),
        'Bu kliniğin hekim ciro raporuna erişim yetkiniz yok.'
      )
      .orThrow('payment.provider-revenue');

    const rows = await this.paymentQueryRepo.providerRevenue({
      clinicId,
      dateFrom,
      dateTo,
    });

    const zero = new Decimal(0);
    const acc = new Map<string, { collected: Decimal; count: number }>();
    let totalCollected = zero;

    for (const row of rows) {
      const key = row.providerId ?? UNASSIGNED;
      const entry = acc.get(key) ?? { collected: zero, count: 0 };
      entry.collected = entry.collected.plus(
        new Decimal(row.amount.toString())
      );
      entry.count += 1;
      acc.set(key, entry);
      totalCollected = totalCollected.plus(new Decimal(row.amount.toString()));
    }

    // Sıralama string'e dönmeden önce ham Decimal'lar üzerinde yapılır.
    // UNASSIGNED grubu ciro büyüklüğünden bağımsız olarak her zaman en alta sabitlenir.
    const lines: ProviderRevenueLine[] = [...acc.entries()]
      .sort(([aKey, aEntry], [bKey, bEntry]) => {
        if (aKey === UNASSIGNED) return 1;
        if (bKey === UNASSIGNED) return -1;
        return bEntry.collected.comparedTo(aEntry.collected);
      })
      .map(([key, entry]) => ({
        providerId: key === UNASSIGNED ? null : key,
        collected: entry.collected.toFixed(2),
        count: entry.count,
      }));

    return {
      data: {
        clinicId,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        lines,
        totalCollected: totalCollected.toFixed(2),
      },
      meta: {
        serializationOptions: policy.getSerializationOptions({ clinicId }),
      },
    };
  }
}
