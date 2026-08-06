import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class ProviderShiftQueryRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
}
