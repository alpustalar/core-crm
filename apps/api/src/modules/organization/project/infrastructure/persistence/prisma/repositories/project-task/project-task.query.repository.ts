import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProjectTask as IProjectTask } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Paginated } from '@common/interfaces/paginated.type';
import { IProjectTaskQueryRepository } from '@modules/organization/project/domain/repositories/project-task/project-task.query.repository';
import {
  FindMyProjectTasksFilter,
  FindProjectTasksFilter,
} from '@modules/organization/project/domain/contracts/project.contracts';

@Injectable()
export class ProjectTaskQueryRepository
  extends BaseRepository
  implements IProjectTaskQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Pano tek ekranda çizilir; sayfalama panoyu bozacağı için `paginate`
   * kullanılmaz — sorgu tek projeyle sınırlı olduğundan satır sayısı yönetilebilir.
   */
  findByProject(filter: FindProjectTasksFilter): Promise<IProjectTask[]> {
    const where: Prisma.ProjectTaskWhereInput = {
      projectId: filter.projectId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.assigneeId ? { assigneeId: filter.assigneeId } : {}),
      ...(filter.phaseId ? { phaseId: filter.phaseId } : {}),
    };

    return this.db.projectTask.findMany({
      where,
      orderBy: [{ status: 'asc' }, { boardOrder: 'asc' }],
    });
  }

  findAssignedTo(
    filter: FindMyProjectTasksFilter
  ): Promise<Paginated<IProjectTask>> {
    const where: Prisma.ProjectTaskWhereInput = {
      clinicId: filter.clinicId,
      assigneeId: filter.assigneeId,
      ...(filter.status
        ? { status: filter.status }
        : // Varsayılan "işim var mı" görünümü: kapanmış kartlar listeyi doldurmasın.
          { status: { notIn: ['DONE', 'CANCELLED'] } }),
    };

    return paginate({
      delegate: this.db.projectTask,
      pagination: filter.pagination,
      where,
    });
  }
}
