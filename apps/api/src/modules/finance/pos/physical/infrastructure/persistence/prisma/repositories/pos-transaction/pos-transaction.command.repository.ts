import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPosTransactionCommandRepository } from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PosTransactionCommandRepository
  extends BaseRepository
  implements IPosTransactionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string) {
    const data = await this.db.posTransaction.findUnique({ where: { id } });
    return data ? new PosTransaction(data) : null;
  }

  async create(posTransaction: PosTransaction): Promise<PosTransaction> {
    const persistenceData = posTransaction.toPersistence();

    const data = {
      ...persistenceData,
      rawRequest: (persistenceData.rawRequest ??
        Prisma.DbNull) as Prisma.InputJsonValue,
      rawResponse: (persistenceData.rawResponse ??
        Prisma.DbNull) as Prisma.InputJsonValue,
    };
    const raw = await this.db.posTransaction.create({ data });
    posTransaction.flushEvents();
    return new PosTransaction(raw);
  }

  async update(entity: PosTransaction): Promise<PosTransaction> {
    const { id, ...data } = entity.toPersistence();
    const raw = await this.db.posTransaction.update({
      where: { id },
      data: {
        status: data.status,
        externalRef: data.externalRef,
        rawRequest: data.rawRequest ?? undefined,
        rawResponse: data.rawResponse ?? undefined,
        completedAt: data.completedAt,
        updatedAt: data.updatedAt,
      },
    });
    entity.flushEvents();
    return new PosTransaction(raw);
  }
}
