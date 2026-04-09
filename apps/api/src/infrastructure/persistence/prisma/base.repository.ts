import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/als-storage';

export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected get db() {
    return txStorage.getStore()?.tx ?? this.prisma;
  }
}
