import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';

@Injectable()
export class ProviderRepository extends BaseRepository {
  create(data: Prisma.ProviderCreateInput) {
    return this.db.provider.create({ data });
  }
}
