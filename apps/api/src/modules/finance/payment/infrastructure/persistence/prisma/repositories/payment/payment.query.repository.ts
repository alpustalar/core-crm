import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { InstallmentStatus, Prisma } from '@prisma/client';
import { Payment } from '@shared';
import {
  ArAgingData,
  ArAgingFilter,
  CollectedInstallmentRow,
  ProviderRevenueFilterData,
} from '@modules/finance/payment/domain/contracts/payment.contracts';
import {
  IPaymentQueryRepository,
  PaymentWithInstallments,
} from '@modules/finance/payment/domain/repositories/payment/payment.query.repository';

/** Henüz tahsil edilmemiş (açık) taksit durumları. */
const OUTSTANDING_STATUSES = [
  InstallmentStatus.PENDING,
  InstallmentStatus.OVERDUE,
];

@Injectable()
export class PaymentQueryRepository
  extends BaseRepository
  implements IPaymentQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByAppointmentId(appointmentId: string): Promise<Payment | null> {
    return this.db.payment.findUnique({ where: { appointmentId } });
  }

  findPaymentWithInstallments(
    paymentId: string
  ): Promise<PaymentWithInstallments | null> {
    return this.db.payment.findUnique({
      where: { id: paymentId },
      include: { installments: { orderBy: { installmentNo: 'asc' } } },
    });
  }

  async arAging(filter: ArAgingFilter): Promise<ArAgingData> {
    const [openRows, collected] = await Promise.all([
      this.db.paymentInstallment.findMany({
        where: {
          status: { in: OUTSTANDING_STATUSES },
          payment: { clinicId: filter.clinicId },
        },
        select: {
          amount: true,
          dueDate: true,
          payment: { select: { patientId: true } },
        },
      }),
      this.db.paymentInstallment.aggregate({
        where: {
          status: InstallmentStatus.COMPLETED,
          payment: { clinicId: filter.clinicId },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      openInstallments: openRows.map((row) => ({
        patientId: row.payment.patientId,
        amount: row.amount,
        dueDate: row.dueDate,
      })),
      collectedTotal: collected._sum.amount ?? new Prisma.Decimal(0),
    };
  }

  async providerRevenue(
    filter: ProviderRevenueFilterData
  ): Promise<CollectedInstallmentRow[]> {
    const where: Prisma.PaymentInstallmentWhereInput = {
      status: InstallmentStatus.COMPLETED,
      payment: { clinicId: filter.clinicId },
    };
    if (filter.dateFrom || filter.dateTo) {
      where.paidAt = { gte: filter.dateFrom, lte: filter.dateTo };
    }

    const rows = await this.db.paymentInstallment.findMany({
      where,
      select: {
        amount: true,
        payment: { select: { providerId: true } },
      },
    });

    return rows.map((row) => ({
      providerId: row.payment.providerId,
      amount: row.amount,
    }));
  }
}
