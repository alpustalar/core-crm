import { Injectable } from '@nestjs/common';
import {
  InstallmentStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  CreateInstallmentPlanInput,
  CreateSinglePaymentInput,
  IPaymentRepository,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';

@Injectable()
export class PaymentRepository
  extends BaseRepository
  implements IPaymentRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async createSinglePayment(input: CreateSinglePaymentInput) {
    const amount = new Prisma.Decimal(input.amount);
    return this.db.payment.create({
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
      include: { installments: true },
    });
  }

  async createInstallmentPlan(input: CreateInstallmentPlanInput) {
    const totalAmount = input.installments.reduce(
      (sum, i) => sum.add(new Prisma.Decimal(i.amount)),
      new Prisma.Decimal(0)
    );

    return this.db.payment.create({
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
      include: { installments: true },
    });
  }

  findByAppointmentId(appointmentId: string) {
    return this.db.payment.findUnique({ where: { appointmentId } });
  }

  findPaymentWithInstallments(paymentId: string) {
    return this.db.payment.findUnique({
      where: { id: paymentId },
      include: {
        installments: {
          orderBy: { installmentNo: 'asc' },
        },
      },
    });
  }

  async markInstallmentAsPaid(installmentId: string) {
    const installment = await this.db.paymentInstallment.update({
      where: { id: installmentId },
      data: { status: InstallmentStatus.COMPLETED, paidAt: new Date() },
    });

    const pendingCount = await this.db.paymentInstallment.count({
      where: {
        paymentId: installment.paymentId,
        status: {
          notIn: [InstallmentStatus.COMPLETED, InstallmentStatus.CANCELLED],
        },
      },
    });

    await this.db.payment.update({
      where: { id: installment.paymentId },
      data: {
        status:
          pendingCount === 0 ? PaymentStatus.COMPLETED : PaymentStatus.PARTIAL,
      },
    });

    return installment;
  }

  async markInstallmentAsFailed(installmentId: string) {
    return this.db.paymentInstallment.update({
      where: { id: installmentId },
      data: { status: InstallmentStatus.PENDING },
    });
  }

  async markInstallmentAsRefunded(installmentId: string) {
    const installment = await this.db.paymentInstallment.update({
      where: { id: installmentId },
      data: { status: InstallmentStatus.REFUNDED },
    });

    await this.db.payment.update({
      where: { id: installment.paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });

    return installment;
  }

  async markInstallmentAsCancelled(installmentId: string) {
    const installment = await this.db.paymentInstallment.update({
      where: { id: installmentId },
      data: { status: InstallmentStatus.CANCELLED },
    });

    const pendingCount = await this.db.paymentInstallment.count({
      where: {
        paymentId: installment.paymentId,
        status: { notIn: [InstallmentStatus.CANCELLED] },
      },
    });

    if (pendingCount === 0) {
      await this.db.payment.update({
        where: { id: installment.paymentId },
        data: { status: PaymentStatus.CANCELLED },
      });
    }

    return installment;
  }
}
