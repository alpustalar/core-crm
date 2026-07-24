import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { IIyzicoTransactionCommandRepository } from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { IyzicoTransaction } from '@modules/finance/pos/virtual/domain/entities/iyzico-transaction.entity';

@Injectable()
export class IyzicoTransactionCommandRepository
  extends BaseRepository
  implements IIyzicoTransactionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
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

  async save(entity: IyzicoTransaction): Promise<IyzicoTransaction> {
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
