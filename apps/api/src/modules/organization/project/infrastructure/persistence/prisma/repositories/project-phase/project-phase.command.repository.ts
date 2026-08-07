import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProjectPhase } from '@modules/organization/project/domain/entities/project-phase.entity';
import { IProjectPhaseCommandRepository } from '@modules/organization/project/domain/repositories/project-phase/project-phase.command.repository';

@Injectable()
export class ProjectPhaseCommandRepository
  extends BaseCommandRepository<ProjectPhase>
  implements IProjectPhaseCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: ProjectPhase): Promise<ProjectPhase> {
    const raw = await this.db.projectPhase.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new ProjectPhase(raw);
  }

  async update(entity: ProjectPhase): Promise<ProjectPhase> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.projectPhase.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new ProjectPhase(raw);
  }

  async findById(id: string): Promise<ProjectPhase | null> {
    const raw = await this.db.projectPhase.findUnique({ where: { id } });
    return raw ? new ProjectPhase(raw) : null;
  }

  async findByOrder(
    projectId: string,
    order: number
  ): Promise<ProjectPhase | null> {
    const raw = await this.db.projectPhase.findUnique({
      where: { projectId_order: { projectId, order } },
    });
    return raw ? new ProjectPhase(raw) : null;
  }
}
