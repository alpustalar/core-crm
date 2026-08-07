import { Injectable } from '@nestjs/common';
import { ProjectTaskStatus } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProjectTask } from '@modules/organization/project/domain/entities/project-task.entity';
import { IProjectTaskCommandRepository } from '@modules/organization/project/domain/repositories/project-task/project-task.command.repository';

@Injectable()
export class ProjectTaskCommandRepository
  extends BaseCommandRepository<ProjectTask>
  implements IProjectTaskCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: ProjectTask): Promise<ProjectTask> {
    const raw = await this.db.projectTask.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new ProjectTask(raw);
  }

  async update(entity: ProjectTask): Promise<ProjectTask> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.projectTask.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new ProjectTask(raw);
  }

  async findById(id: string): Promise<ProjectTask | null> {
    const raw = await this.db.projectTask.findUnique({ where: { id } });
    return raw ? new ProjectTask(raw) : null;
  }

  async maxBoardOrder(projectId: string, status: string): Promise<number> {
    const result = await this.db.projectTask.aggregate({
      where: { projectId, status: status as ProjectTaskStatus },
      _max: { boardOrder: true },
    });
    return result._max.boardOrder ?? -1;
  }
}
