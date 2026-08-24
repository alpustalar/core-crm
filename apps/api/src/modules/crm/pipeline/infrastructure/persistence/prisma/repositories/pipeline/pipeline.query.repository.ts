import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  PipelineStageView,
  PipelineWithStages,
} from '@modules/crm/pipeline/domain/contracts';
import { Prisma } from '@prisma/client';
import { IPipelineQueryRepository } from '@modules/crm/pipeline/domain/repositories/pipeline/pipeline.query.repository';

type PipelineWithStagesRow = Prisma.PipelineGetPayload<{
  include: { stages: true };
}>;

@Injectable()
export class PipelineQueryRepository
  extends BaseRepository
  implements IPipelineQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<PipelineWithStages | null> {
    const row = await this.db.pipeline.findFirst({
      where: { id, isDeleted: false },
      include: {
        stages: { where: { isDeleted: false }, orderBy: { order: 'asc' } },
      },
    });
    return row ? this.toView(row) : null;
  }

  async findByClinic(clinicId: string): Promise<PipelineWithStages[]> {
    const rows = await this.db.pipeline.findMany({
      where: { clinicId, isDeleted: false },
      include: {
        stages: { where: { isDeleted: false }, orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toView(r));
  }

  async findDefaultByClinic(
    clinicId: string
  ): Promise<PipelineWithStages | null> {
    const row = await this.db.pipeline.findFirst({
      where: { clinicId, isDefault: true, isDeleted: false },
      include: {
        stages: { where: { isDeleted: false }, orderBy: { order: 'asc' } },
      },
    });
    return row ? this.toView(row) : null;
  }

  async findStageById(stageId: string): Promise<PipelineStageView | null> {
    const s = await this.db.pipelineStage.findFirst({
      where: { id: stageId, isDeleted: false },
    });
    if (!s) return null;
    return {
      id: s.id,
      pipelineId: s.pipelineId,
      name: s.name,
      order: s.order,
      type: s.type,
      color: s.color,
    };
  }

  private toView(row: PipelineWithStagesRow): PipelineWithStages {
    const stages: PipelineStageView[] = row.stages.map((s) => ({
      id: s.id,
      pipelineId: s.pipelineId,
      name: s.name,
      order: s.order,
      type: s.type,
      color: s.color,
    }));
    return {
      id: row.id,
      organizationId: row.organizationId,
      clinicId: row.clinicId,
      name: row.name,
      isDefault: row.isDefault,
      stages,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
