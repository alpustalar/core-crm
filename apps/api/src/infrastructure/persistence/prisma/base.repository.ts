import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import { Prisma } from '@prisma/client';

export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected get db() {
    return txStorage.getStore()?.tx ?? this.prisma;
  }

  protected async atomic<T extends any[]>(
    operations: [...{ [K in keyof T]: Prisma.PrismaPromise<T[K]> }]
  ): Promise<T> {
    const activeTx = txStorage.getStore()?.tx;

    if (activeTx) {
      // eslint-disable-next-line
      return (await Promise.all(operations)) as unknown as Promise<T>;
    }

    return (await this.prisma.$transaction(
      operations
    )) as unknown as Promise<T>;
  }
}
