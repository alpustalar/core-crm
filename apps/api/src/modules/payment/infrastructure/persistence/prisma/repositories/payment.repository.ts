import { Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

interface CreatePaymentInput {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  expectedAmount: number;
  currency: string;
}

interface MarkRefundedInput {
  paymentId: string;
  iyzicoTransactionId: string;
  rawResponse: Prisma.InputJsonValue;
}

@Injectable()
export class PaymentRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  createPayment(input: CreatePaymentInput) {
    return this.db.payment.create({
      data: {
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        expectedAmount: new Prisma.Decimal(input.expectedAmount),
        currency: input.currency,
      },
    });
  }

  findByAppointmentId(appointmentId: string) {
    return this.db.payment.findUnique({ where: { appointmentId } });
  }

  findPaymentWithTransaction(paymentId: string) {
    return this.db.payment.findUnique({
      where: { id: paymentId },
      include: { iyzicoTransaction: true },
    });
  }

  markAsSuccess(paymentId: string) {
    return this.db.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.COMPLETED },
    });
  }

  markAsRefunded(input: MarkRefundedInput) {
    return this.db.payment.update({
      where: { id: input.paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        iyzicoTransaction: {
          update: {
            where: { id: input.iyzicoTransactionId },
            data: { rawResponse: input.rawResponse },
          },
        },
      },
    });
  }

  markAsFailed(paymentId: string) {
    return this.db.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
    });
  }

  markAsCancelled(paymentId: string) {
    return this.db.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.CANCELLED },
    });
  }
}
