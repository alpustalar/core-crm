import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { IyzicoTransactionStatus, Prisma } from '@prisma/client';
import {
  CreateIyzicoTransactionInput,
  IIyzicoTransactionRepository,
  MarkFailedInput,
  MarkPaidInput,
  MarkRefundedInput,
} from '../domain/interfaces/iyzico-transaction.repository.interface';

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
        status: IyzicoTransactionStatus.INITIALIZE,
      },
    });
  }

  markAsSuccess(input: MarkPaidInput) {
    return this.db.iyzicoTransaction.update({
      where: { id: input.iyzicoTransactionId },
      data: {
        status: IyzicoTransactionStatus.SUCCESS,
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
        status: IyzicoTransactionStatus.FAILURE,
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
        status: IyzicoTransactionStatus.REFUNDED,
        rawResponse:
          (input.rawResponse as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }
}
