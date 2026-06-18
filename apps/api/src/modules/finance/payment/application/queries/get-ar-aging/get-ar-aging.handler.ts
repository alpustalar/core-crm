import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DateTimeManager } from '@common/utils';
import {
  IPaymentQueryRepository,
  PAYMENT_QUERY_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { OpenInstallmentRow } from '@modules/finance/payment/domain/types/ar-aging.type';
import { GetArAgingQuery } from './get-ar-aging.query';
import {
  ArAgingBucket,
  ArAgingBucketLabel,
  ArAgingPatientRisk,
  GetArAgingResponse,
} from './get-ar-aging.response';
import { Decimal } from 'decimal.js';

const BUCKET_ORDER: ArAgingBucketLabel[] = [
  'NOT_DUE',
  'D0_30',
  'D31_60',
  'D61_90',
  'D90_PLUS',
];

interface PatientAccumulator {
  outstanding: Decimal;
  overdue: Decimal;
  oldestDueDate: Date | null;
}

@QueryHandler(GetArAgingQuery)
export class GetArAgingHandler
  implements IQueryHandler<GetArAgingQuery, GetArAgingResponse>
{
  constructor(
    @Inject(PAYMENT_QUERY_REPOSITORY)
    private readonly paymentQueryRepo: IPaymentQueryRepository
  ) {}

  async execute(query: GetArAgingQuery): Promise<GetArAgingResponse> {
    const { clinicId } = query;
    // Saat farkından kaynaklanan yanlış vadelendirmeyi önlemek için gün başına normalize et.
    const asOf = DateTimeManager.startOfDay(query.asOf ?? new Date());

    const { openInstallments, collectedTotal } =
      await this.paymentQueryRepo.arAging({ clinicId });

    const buckets = this.buildBuckets(openInstallments, asOf);
    const patients = this.buildPatientRisk(openInstallments, asOf);

    const zero = new Decimal(0);
    const totalOutstanding = openInstallments.reduce(
      (sum, row) => sum.plus(new Decimal(row.amount.toString())),
      zero
    );
    const totalOverdue = openInstallments.reduce(
      (sum, row) =>
        this.isOverdue(row, asOf)
          ? sum.plus(new Decimal(row.amount.toString()))
          : sum,
      zero
    );
    const denominator = collectedTotal.plus(totalOutstanding);
    const collectionRate = denominator.isZero()
      ? zero
      : collectedTotal.div(denominator);

    return {
      data: {
        clinicId,
        asOf,
        buckets,
        patients,
        summary: {
          totalOutstanding: totalOutstanding.toFixed(2),
          totalOverdue: totalOverdue.toFixed(2),
          totalCollected: collectedTotal.toFixed(2),
          collectionRate: collectionRate.toFixed(4),
        },
      },
    };
  }

  private buildBuckets(
    rows: OpenInstallmentRow[],
    asOf: Date
  ): ArAgingBucket[] {
    const zero = new Decimal(0);
    const acc = new Map<ArAgingBucketLabel, { count: number; amount: Decimal }>(
      BUCKET_ORDER.map((label) => [label, { count: 0, amount: zero }])
    );

    for (const row of rows) {
      const label = this.classify(row, asOf);
      const bucket = acc.get(label)!;
      bucket.count += 1;
      bucket.amount = bucket.amount.plus(new Decimal(row.amount.toString()));
    }

    return BUCKET_ORDER.map((label) => {
      const bucket = acc.get(label)!;
      return { label, count: bucket.count, amount: bucket.amount.toFixed(2) };
    });
  }

  private buildPatientRisk(
    rows: OpenInstallmentRow[],
    asOf: Date
  ): ArAgingPatientRisk[] {
    const zero = new Decimal(0);
    const acc = new Map<string, PatientAccumulator>();

    for (const row of rows) {
      const entry = acc.get(row.patientId) ?? {
        outstanding: zero,
        overdue: zero,
        oldestDueDate: null,
      };
      entry.outstanding = entry.outstanding.plus(
        new Decimal(row.amount.toString())
      );
      if (this.isOverdue(row, asOf)) {
        entry.overdue = entry.overdue.plus(new Decimal(row.amount.toString()));
      }
      if (
        row.dueDate &&
        (!entry.oldestDueDate || row.dueDate < entry.oldestDueDate)
      ) {
        entry.oldestDueDate = row.dueDate;
      }
      acc.set(row.patientId, entry);
    }

    // Sıralama string'e dönmeden önce ham Decimal'lar üzerinde yapılır.
    return [...acc.entries()]
      .sort(([, aEntry], [, bEntry]) =>
        bEntry.overdue.comparedTo(aEntry.overdue)
      )
      .map(([patientId, entry]) => ({
        patientId,
        outstanding: entry.outstanding.toFixed(2),
        overdue: entry.overdue.toFixed(2),
        oldestDueDate: entry.oldestDueDate,
      }));
  }

  private classify(row: OpenInstallmentRow, asOf: Date): ArAgingBucketLabel {
    if (!this.isOverdue(row, asOf)) return 'NOT_DUE';
    const days = DateTimeManager.diffInDays(asOf, row.dueDate as Date);
    if (days <= 30) return 'D0_30';
    if (days <= 60) return 'D31_60';
    if (days <= 90) return 'D61_90';
    return 'D90_PLUS';
  }

  // dueDate'i de gün başına normalize ederek saat farkı kaynaklı hatalı vadelendirmeyi engeller.
  private isOverdue(row: OpenInstallmentRow, asOf: Date): boolean {
    return (
      row.dueDate != null &&
      DateTimeManager.startOfDay(row.dueDate) < asOf
    );
  }
}
