import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { Prisma } from '@prisma/client';
import { IyzicoTransactionStatusSchema as IyzicoTransactionStatus } from '@shared';
import { IIyzicoTransactionRepository } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico-transaction.repository.interface';
import { CreateIyzicoTransactionInput } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/types/create-iyzico-transaction.input';
import { MarkPaidInput } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/types/mark-paid.input';
import { MarkFailedInput } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/types/mark-failed.input';
import { MarkRefundedInput } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/types/mark-refunded.input';

@Injectable()
export class IyzicoTransactionRepository
  extends BaseRepository
  implements IIyzicoTransactionRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findTransactionByConversationId(conversationId: string) {
    return this.db.iyzicoTransaction.findUnique({
      where: { conversationId },
      include: {
        installment: {
          include: { payment: true },
        },
      },
    });
  }

  findByInstallmentId(installmentId: string) {
    return this.db.iyzicoTransaction.findUnique({
      where: { installmentId },
    });
  }

  createTransaction(input: CreateIyzicoTransactionInput) {
    return this.db.iyzicoTransaction.create({
      data: {
        installmentId: input.installmentId,
        conversationId: input.conversationId,
        token: input.token,
        status: IyzicoTransactionStatus.enum.INITIALIZE,
      },
    });
  }

  markAsSuccess(input: MarkPaidInput) {
    return this.db.iyzicoTransaction.update({
      where: { id: input.iyzicoTransactionId },
      data: {
        status: IyzicoTransactionStatus.enum.SUCCESS,
        iyzicoPaymentId: input.iyzicoPaymentId,
        iyzicoPaymentTransactionId: input.iyzicoPaymentTransactionId,
        rawResponse:
          (input.rawResponse as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  markAsFailed(input: MarkFailedInput) {
    return this.db.iyzicoTransaction.update({
      where: { id: input.iyzicoTransactionId },
      data: {
        status: IyzicoTransactionStatus.enum.FAILURE,
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
        rawResponse:
          (input.rawResponse as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  markAsRefunded(input: MarkRefundedInput) {
    return this.db.iyzicoTransaction.update({
      where: { id: input.iyzicoTransactionId },
      data: {
        status: IyzicoTransactionStatus.enum.REFUNDED,
        rawResponse:
          (input.rawResponse as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }
}
