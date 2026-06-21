import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import {
  IIyzicoTransactionQueryRepository,
  IyzicoTransactionWithInstallment,
} from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { IyzicoTransaction } from '@modules/finance/pos/virtual/domain/entities/iyzico-transaction.entity';

@Injectable()
export class IyzicoTransactionQueryRepository
  extends BaseRepository
  implements IIyzicoTransactionQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /** Read-model (taksit + ödeme ile birlikte) — callback akışında payment/muhasebe için. */
  findTransactionByConversationId(
    conversationId: string
  ): Promise<IyzicoTransactionWithInstallment | null> {
    return this.db.iyzicoTransaction.findUnique({
      where: { conversationId },
      include: {
        installment: {
          include: { payment: true },
        },
      },
    });
  }

  async findByInstallmentId(
    installmentId: string
  ): Promise<IyzicoTransaction | null> {
    const raw = await this.db.iyzicoTransaction.findUnique({
      where: { installmentId },
    });
    return raw ? new IyzicoTransaction(raw) : null;
  }
}
