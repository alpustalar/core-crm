import { Injectable } from '@nestjs/common';
import {
  FinanceLedger,
  LedgerType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  GetSummaryFilter,
  IFinanceLedgerQueryRepository,
  LedgerSummary,
  PatientFinanceSummary,
  PatientLedgerItem,
  PatientRevenue,
  SumIncomeByPatientsFilter,
} from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { FinanceLedgerEntity } from '@modules/finance/finance-ledger/domain/entities/finance-ledger.entity';

@Injectable()
export class FinanceLedgerQueryRepository
  extends BaseRepository
  implements IFinanceLedgerQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<FinanceLedgerEntity | null> {
    const raw = await this.db.financeLedger.findUnique({ where: { id } });
    return raw ? new FinanceLedgerEntity(raw) : null;
  }

  async findManyByClinicId(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedgerEntity[]; total: number }> {
    const result = await paginate({
      delegate: this.db.financeLedger,
      pagination,
      where: { clinicId },
    });
    return { items: result.items.map((r) => new FinanceLedgerEntity(r)), total: result.total };
  }

  async findManyByPatientId(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedgerEntity[]; total: number }> {
    const result = await paginate({
      delegate: this.db.financeLedger,
      pagination,
      where: { patientId },
    });
    return { items: result.items.map((r) => new FinanceLedgerEntity(r)), total: result.total };
  }

  async findManyByPaymentId(paymentId: string): Promise<FinanceLedgerEntity[]> {
    const rows = await this.db.financeLedger.findMany({ where: { paymentId } });
    return rows.map((r) => new FinanceLedgerEntity(r));
  }

  async findManyByPatientIdWithDetails(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: PatientLedgerItem[]; total: number }> {
    type RawRow = {
      id: string;
      amount: Prisma.Decimal;
      category: FinanceLedger['category'];
      entryDate: Date;
      status: FinanceLedger['status'];
      description: string | null;
      payment: {
        method: PaymentMethod;
        provider: { name: string } | null;
      } | null;
    };

    const result = (await paginate({
      delegate: this.db.financeLedger as never,
      pagination,
      where: { patientId },
      include: {
        payment: {
          select: {
            method: true,
            provider: { select: { name: true } },
          },
        },
      },
    })) as { items: RawRow[]; total: number };

    return {
      total: result.total,
      items: result.items.map((row) => ({
        id: row.id,
        amount: row.amount.toFixed(2),
        category: row.category,
        entryDate: row.entryDate,
        status: row.status,
        description: row.description,
        paymentMethod: row.payment?.method ?? null,
        providerName: row.payment?.provider?.name ?? null,
      })),
    };
  }

  async getPatientSummary(patientId: string): Promise<PatientFinanceSummary> {
    const [ledgerRows, paymentAgg] = await Promise.all([
      this.db.financeLedger.groupBy({
        by: ['type'],
        where: { patientId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.db.payment.aggregate({
        where: {
          patientId,
          status: { notIn: [PaymentStatus.CANCELLED, PaymentStatus.FAILED] },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    let totalPayments = new Prisma.Decimal(0);
    for (const row of ledgerRows) {
      if (row.type === LedgerType.INCOME) {
        totalPayments = totalPayments.add(row._sum.amount ?? 0);
      }
    }

    const totalServiceAmount =
      paymentAgg._sum?.totalAmount ?? new Prisma.Decimal(0);
    const balance = totalPayments.sub(totalServiceAmount);

    return {
      balance: balance.toFixed(2),
      totalServiceAmount: totalServiceAmount.toFixed(2),
      totalPayments: totalPayments.toFixed(2),
    };
  }

  async getClinicSummary(
    clinicId: string,
    { dateFrom, dateTo }: GetSummaryFilter
  ): Promise<LedgerSummary> {
    const dateFilter =
      dateFrom || dateTo
        ? {
            entryDate: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {};

    const rows = await this.db.financeLedger.groupBy({
      by: ['type'],
      where: { clinicId, status: 'COMPLETED', ...dateFilter },
      _sum: { amount: true },
      _count: { id: true },
    });

    let totalIncome = new Prisma.Decimal(0);
    let totalExpenses = new Prisma.Decimal(0);
    let entryCount = 0;

    for (const row of rows) {
      const sum = row._sum.amount ?? new Prisma.Decimal(0);
      entryCount += row._count.id;

      if (row.type === LedgerType.INCOME) {
        totalIncome = totalIncome.add(sum);
      } else {
        totalExpenses = totalExpenses.add(sum);
      }
    }

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      balance: totalIncome.sub(totalExpenses).toFixed(2),
      entryCount,
    };
  }

  async sumIncomeByPatientIds(
    filter: SumIncomeByPatientsFilter
  ): Promise<PatientRevenue[]> {
    if (filter.patientIds.length === 0) return [];

    const rows = await this.db.financeLedger.groupBy({
      by: ['patientId'],
      where: {
        patientId: { in: filter.patientIds },
        type: LedgerType.INCOME,
        status: 'COMPLETED',
        entryDate: { gte: filter.from, lte: filter.to },
      },
      _sum: { amount: true },
    });

    return rows
      .filter((r) => r.patientId !== null)
      .map((r) => ({
        patientId: r.patientId as string,
        revenue: (r._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
      }));
  }
}
