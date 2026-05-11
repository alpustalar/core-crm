import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { IyzicoTransactionStatus, Prisma } from '@prisma/client';

interface CreateIyzicoTransactionInput {
  paymentId: string;
  conversationId: string;
  token?: string;
}

interface MarkPaidInput {
  iyzicoTransactionId: string;
  iyzicoPaymentId: string;
  iyzicoPaymentTransactionId?: string;
  rawResponse?: unknown;
}

interface MarkRefundedInput {
  iyzicoTransactionId: string;
  rawResponse?: unknown;
}

interface MarkFailedInput {
  iyzicoTransactionId: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

@Injectable()
export class IyzicoTransactionRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findTransactionByConversationId(conversationId: string) {
    return this.db.iyzicoTransaction.findUnique({
      where: { conversationId },
      include: { payment: true },
    });
  }

  createTransaction(input: CreateIyzicoTransactionInput) {
    return this.db.iyzicoTransaction.create({
      data: {
        paymentId: input.paymentId,
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
