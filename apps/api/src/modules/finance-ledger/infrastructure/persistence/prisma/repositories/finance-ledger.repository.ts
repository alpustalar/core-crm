import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  CreateLedgerEntryData,
  GetSummaryFilter,
  IFinanceLedgerRepository,
  LedgerSummary,
} from '../../../../domain/repositories/finance-ledger.repository.interface';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination } from '@shared';
import {
  FinanceLedger,
  LedgerStatus,
  LedgerType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class FinanceLedgerRepository
  extends BaseRepository
  implements IFinanceLedgerRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(data: CreateLedgerEntryData): Promise<FinanceLedger> {
    return this.db.financeLedger.create({
      data: {
        ...data,
        amount: new Prisma.Decimal(data.amount),
      },
    });
  }

  findById(id: string): Promise<FinanceLedger | null> {
    return this.db.financeLedger.findUnique({ where: { id } });
  }

  findManyByClinicId(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedger[]; total: number }> {
    return paginate({
      delegate: this.db.financeLedger,
      pagination,
      where: { clinicId },
    });
  }

  findManyByPatientId(
    patientId: string,
    pagination: Pagination
  ): Promise<{ items: FinanceLedger[]; total: number }> {
    return paginate({
      delegate: this.db.financeLedger,
      pagination,
      where: { patientId },
    });
  }

  findManyByPaymentId(paymentId: string): Promise<FinanceLedger[]> {
    return this.db.financeLedger.findMany({ where: { paymentId } });
  }

  updateStatus(id: string, status: LedgerStatus): Promise<FinanceLedger> {
    return this.db.financeLedger.update({ where: { id }, data: { status } });
  }

  async updateManyStatusByPaymentId(
    paymentId: string,
    status: LedgerStatus
  ): Promise<void> {
    await this.db.financeLedger.updateMany({
      where: { paymentId },
      data: { status },
    });
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
}
