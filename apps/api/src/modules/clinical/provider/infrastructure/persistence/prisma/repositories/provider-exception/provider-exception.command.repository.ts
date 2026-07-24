import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { ProviderException } from '@modules/clinical/provider/domain/entities/provider-exception.entity';
import { IProviderExceptionCommandRepository } from '@modules/clinical/provider/domain/repositories/provider-exception.repository.interface';

@Injectable()
export class ProviderExceptionCommandRepository
  extends BaseCommandRepository<ProviderException>
  implements IProviderExceptionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ProviderException | null> {
    const raw = await this.db.providerException.findUnique({ where: { id } });
    return raw ? new ProviderException(raw) : null;
  }

  async create(entity: ProviderException): Promise<ProviderException> {
    const data = entity.toPersistence();
    const raw = await this.db.providerException.create({ data });
    entity.flushEvents();
    return new ProviderException(raw);
  }
  async save(entity: ProviderException): Promise<ProviderException> {
    const persistenceData = entity.toPersistence();
    const { id, ...data } = persistenceData;
    const raw = await this.db.providerException.update({
      where: { id },
      data,
    });
    entity.flushEvents();
    return new ProviderException(raw);
  }

  async sync(entity: ProviderException): Promise<ProviderException> {
    const create = entity.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.providerException.upsert({
      where: { id },
      create,
      update,
    });
    entity.flushEvents();
    return new ProviderException(raw);
  }
}
