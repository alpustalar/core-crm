import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import {
  IIyzicoTransactionCommandRepository,
  IyzicoTransactionWithInstallment,
} from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { IyzicoTransaction } from '@modules/finance/pos/virtual/domain/entities/iyzico-transaction.entity';

@Injectable()
export class IyzicoTransactionCommandRepository
  extends BaseRepository
  implements IIyzicoTransactionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByConversationIdForUpdate(
    conversationId: string
  ): Promise<IyzicoTransactionWithInstallment | null> {
    const existing = await this.db.iyzicoTransaction.findUnique({
      where: { conversationId },
      select: { id: true },
    });
    if (!existing) return null;

    await this.lockRowForUpdate('iyzico_transactions', existing.id);

    return this.db.iyzicoTransaction.findUnique({
      where: { id: existing.id },
      include: { installment: { include: { payment: true } } },
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

  async findByInstallmentIdForUpdate(
    installmentId: string
  ): Promise<IyzicoTransaction | null> {
    const existing = await this.db.iyzicoTransaction.findUnique({
      where: { installmentId },
      select: { id: true },
    });
    if (!existing) return null;

    await this.lockRowForUpdate('iyzico_transactions', existing.id);

    const raw = await this.db.iyzicoTransaction.findUnique({
      where: { id: existing.id },
    });
    return raw ? new IyzicoTransaction(raw) : null;
  }

  async create(entity: IyzicoTransaction): Promise<IyzicoTransaction> {
    const data = entity.toPersistence();
    const rawResponse =
      data.rawResponse === null
        ? Prisma.JsonNull
        : (data.rawResponse as Prisma.InputJsonValue);

    const raw = await this.db.iyzicoTransaction.create({
      data: { ...data, rawResponse },
    });
    entity.flushEvents();
    return new IyzicoTransaction(raw);
  }

  async update(entity: IyzicoTransaction): Promise<IyzicoTransaction> {
    const data = entity.toPersistence();
    const { id, ...rest } = data;
    const rawResponse =
      data.rawResponse === null
        ? Prisma.JsonNull
        : (data.rawResponse as Prisma.InputJsonValue);

    const raw = await this.db.iyzicoTransaction.update({
      where: { id },
      data: { ...rest, rawResponse },
    });
    entity.flushEvents();
    return new IyzicoTransaction(raw);
  }
}
