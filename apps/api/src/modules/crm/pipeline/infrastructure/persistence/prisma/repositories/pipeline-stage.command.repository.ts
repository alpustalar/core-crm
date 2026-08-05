import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPipelineStageCommandRepository } from '@modules/crm/pipeline/domain/repositories/pipeline.repository';
import { PipelineStage } from '@modules/crm/pipeline/domain/entities/pipeline-stage.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class PipelineStageCommandRepository
  extends BaseCommandRepository<PipelineStage>
  implements IPipelineStageCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: PipelineStage): Promise<PipelineStage> {
    const raw = await this.db.pipelineStage.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new PipelineStage(raw);
  }

  async findById(id: string): Promise<PipelineStage | null> {
    const raw = await this.db.pipelineStage.findUnique({ where: { id } });
    return raw ? new PipelineStage(raw) : null;
  }

  async update(entity: PipelineStage): Promise<PipelineStage> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.pipelineStage.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new PipelineStage(raw);
  }

  async createMany(stages: PipelineStage[]): Promise<void> {
    const queries = stages.map((s) =>
      this.db.pipelineStage.create({ data: s.toPersistence() })
    );
    if (txStorage.getStore()?.tx) {
      await Promise.all(queries);
    } else {
      await this.prisma.$transaction(queries);
    }
    stages.forEach((s) => s.flushEvents());
  }

  async findByPipelineId(pipelineId: string): Promise<PipelineStage[]> {
    const rows = await this.db.pipelineStage.findMany({
      where: { pipelineId, isDeleted: false },
      orderBy: { order: 'asc' },
    });
    return rows.map((r) => new PipelineStage(r));
  }
}
