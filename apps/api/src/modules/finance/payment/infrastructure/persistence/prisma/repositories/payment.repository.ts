import { Injectable } from '@nestjs/common';
import { InstallmentStatus, PaymentMethod, Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import {
  CreateInstallmentPlanInput,
  CreateSinglePaymentInput,
  IPaymentRepository,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import {
  ArAgingData,
  ArAgingFilter,
} from '@modules/finance/payment/domain/types/ar-aging.type';
import {
  CollectedInstallmentRow,
  ProviderRevenueFilter,
} from '@modules/finance/payment/domain/types/provider-revenue.type';

const INSTALLMENTS_INCLUDE = {
  installments: { orderBy: { installmentNo: 'asc' } },
} as const;

/** Henüz tahsil edilmemiş (açık) taksit durumları. */
const OUTSTANDING_STATUSES = [
  InstallmentStatus.PENDING,
  InstallmentStatus.OVERDUE,
];

@Injectable()
export class PaymentRepository
  extends BaseRepository
  implements IPaymentRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async createSinglePayment(input: CreateSinglePaymentInput): Promise<Payment> {
    const amount = new Prisma.Decimal(input.amount);
    const raw = await this.db.payment.create({
      data: {
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        providerId: input.providerId,
        totalAmount: amount,
        currency: input.currency,
        installments: {
          create: {
            installmentNo: 1,
            amount,
            currency: input.currency,
            method: input.method ?? PaymentMethod.CREDIT_CARD,
            dueDate: input.dueDate,
          },
        },
      },
      include: INSTALLMENTS_INCLUDE,
    });
    return new Payment(raw);
  }

  async createInstallmentPlan(
    input: CreateInstallmentPlanInput
  ): Promise<Payment> {
    const totalAmount = input.installments.reduce(
      (sum, i) => sum.add(new Prisma.Decimal(i.amount)),
      new Prisma.Decimal(0)
    );

    const raw = await this.db.payment.create({
      data: {
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        providerId: input.providerId,
        totalAmount,
        currency: input.currency,
        installments: {
          create: input.installments.map((inst, idx) => ({
            installmentNo: idx + 1,
            amount: new Prisma.Decimal(inst.amount),
            currency: input.currency,
            method: inst.method,
            dueDate: inst.dueDate,
            note: inst.note,
          })),
        },
      },
      include: INSTALLMENTS_INCLUDE,
    });
    return new Payment(raw);
  }

  async findByAppointmentId(appointmentId: string): Promise<Payment | null> {
    const raw = await this.db.payment.findUnique({
      where: { appointmentId },
      include: INSTALLMENTS_INCLUDE,
    });
    return raw ? new Payment(raw) : null;
  }

  async findPaymentWithInstallments(
    paymentId: string
  ): Promise<Payment | null> {
    const raw = await this.db.payment.findUnique({
      where: { id: paymentId },
      include: INSTALLMENTS_INCLUDE,
    });
    return raw ? new Payment(raw) : null;
  }

  async findByInstallmentId(installmentId: string): Promise<Payment | null> {
    const raw = await this.db.payment.findFirst({
      where: { installments: { some: { id: installmentId } } },
      include: INSTALLMENTS_INCLUDE,
    });
    return raw ? new Payment(raw) : null;
  }

  async save(entity: Payment): Promise<Payment> {
    const data = entity.toPersistence();

    const paymentOp = this.db.payment.upsert({
      where: { id: data.id },
      create: data as Prisma.PaymentUncheckedCreateInput,
      update: data,
    });
    const installmentOps = entity.installments.map((inst) =>
      this.db.paymentInstallment.upsert({
        where: { id: inst.id },
        create: {
          id: inst.id,
          paymentId: inst.paymentId,
          installmentNo: inst.installmentNo,
          amount: inst.amount,
          currency: inst.currency,
          method: inst.method,
          status: inst.status,
          dueDate: inst.dueDate,
          paidAt: inst.paidAt,
          note: inst.note,
        },
        update: { status: inst.status, paidAt: inst.paidAt },
      })
    );

    if (txStorage.getStore()?.tx) {
      await Promise.all([paymentOp, ...installmentOps]);
    } else {
      await this.prisma.$transaction([paymentOp, ...installmentOps]);
    }

    entity.flushEvents();
    return entity;
  }

  async saveMany(entities: Payment[]): Promise<void> {
    const allOps = entities.flatMap((entity) => {
      const data = entity.toPersistence();
      const paymentOp = this.db.payment.upsert({
        where: { id: data.id },
        create: data as Prisma.PaymentUncheckedCreateInput,
        update: data,
      });
      const installmentOps = [...entity.dirtyInstallmentIds].map(
        (installmentId) => {
          const inst = entity.installments.find((i) => i.id === installmentId)!;
          return this.db.paymentInstallment.update({
            where: { id: installmentId },
            data: { status: inst.status, paidAt: inst.paidAt },
          });
        }
      );
      return [paymentOp, ...installmentOps];
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(allOps);
    } else {
      await this.prisma.$transaction(allOps);
    }

    entities.forEach((e) => e.flushEvents());
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
    filter: ProviderRevenueFilter
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
