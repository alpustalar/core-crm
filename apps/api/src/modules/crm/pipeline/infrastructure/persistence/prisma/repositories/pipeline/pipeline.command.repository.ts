import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Pipeline } from '@modules/crm/pipeline/domain/entities/pipeline.entity';
import { IPipelineCommandRepository } from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.command.repository';

@Injectable()
export class PipelineCommandRepository
  extends BaseCommandRepository<Pipeline>
  implements IPipelineCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: Pipeline): Promise<Pipeline> {
    const raw = await this.db.pipeline.create({ data: entity.toPersistence() });
    entity.flushEvents();
    return new Pipeline(raw);
  }

  async findById(id: string): Promise<Pipeline | null> {
    const raw = await this.db.pipeline.findUnique({ where: { id } });
    return raw ? new Pipeline(raw) : null;
  }

  async update(entity: Pipeline): Promise<Pipeline> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.pipeline.update({ where: { id }, data: update });
    entity.flushEvents();
    return new Pipeline(raw);
  }
}
