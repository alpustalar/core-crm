import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { GetProviderRevenueQuery } from './get-provider-revenue.query';
import {
  GetProviderRevenueResponse,
  ProviderRevenueLine,
} from './get-provider-revenue.response';

/** providerId null grubu için sabit anahtar (Map key olarak kullanılır). */
const UNASSIGNED = '__unassigned__';

@QueryHandler(GetProviderRevenueQuery)
export class GetProviderRevenueHandler
  implements IQueryHandler<GetProviderRevenueQuery, GetProviderRevenueResponse>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepo: IPaymentRepository
  ) {}

  async execute(
    query: GetProviderRevenueQuery
  ): Promise<GetProviderRevenueResponse> {
    const { clinicId, dateFrom, dateTo } = query;

    const rows = await this.paymentRepo.providerRevenue({
      clinicId,
      dateFrom,
      dateTo,
    });

    const zero = new Prisma.Decimal(0);
    const acc = new Map<string, { collected: Prisma.Decimal; count: number }>();
    let totalCollected = zero;

    for (const row of rows) {
      const key = row.providerId ?? UNASSIGNED;
      const entry = acc.get(key) ?? { collected: zero, count: 0 };
      entry.collected = entry.collected.plus(row.amount);
      entry.count += 1;
      acc.set(key, entry);
      totalCollected = totalCollected.plus(row.amount);
    }

    const lines: ProviderRevenueLine[] = [...acc.entries()]
      .map(([key, entry]) => ({
        providerId: key === UNASSIGNED ? null : key,
        collected: entry.collected.toFixed(2),
        count: entry.count,
      }))
      .sort((a, b) => Number(b.collected) - Number(a.collected));

    return {
      data: {
        clinicId,
        dateFrom: dateFrom ?? null,
        dateTo: dateTo ?? null,
        lines,
        totalCollected: totalCollected.toFixed(2),
      },
    };
  }
}
