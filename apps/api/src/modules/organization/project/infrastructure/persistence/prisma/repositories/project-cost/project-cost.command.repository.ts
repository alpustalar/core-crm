import { Injectable } from '@nestjs/common';
import { ProjectCostSource } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProjectCost } from '@modules/organization/project/domain/entities/project-cost.entity';
import { IProjectCostCommandRepository } from '@modules/organization/project/domain/repositories/project-cost/project-cost.command.repository';

@Injectable()
export class ProjectCostCommandRepository
  extends BaseRepository
  implements IProjectCostCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: ProjectCost): Promise<ProjectCost> {
    const raw = await this.db.projectCost.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new ProjectCost(raw);
  }

  async findById(id: string): Promise<ProjectCost | null> {
    const raw = await this.db.projectCost.findUnique({ where: { id } });
    return raw ? new ProjectCost(raw) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.projectCost.delete({ where: { id } });
  }

  async findBySourceRef(
    projectId: string,
    source: string,
    sourceRefId: string
  ): Promise<ProjectCost | null> {
    const raw = await this.db.projectCost.findUnique({
      where: {
        projectId_source_sourceRefId: {
          projectId,
          source: source as ProjectCostSource,
          sourceRefId,
        },
      },
    });
    return raw ? new ProjectCost(raw) : null;
  }
}
