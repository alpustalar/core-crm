import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Project as IProject } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Paginated } from '@common/interfaces/paginated.type';
import {
  IProjectQueryRepository,
  ProjectWithPhases,
} from '@modules/organization/project/domain/repositories/project/project.query.repository';
import {
  FindProjectsFilter,
  ProjectCostTotalRow,
  ProjectTaskStatusCountRow,
} from '@modules/organization/project/domain/contracts/project.contracts';

@Injectable()
export class ProjectQueryRepository
  extends BaseRepository
  implements IProjectQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findMany(filter: FindProjectsFilter): Promise<Paginated<IProject>> {
    const where: Prisma.ProjectWhereInput = {
      clinicId: filter.clinicId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.ownerId ? { ownerId: filter.ownerId } : {}),
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: 'insensitive' } },
              { code: { contains: filter.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return paginate({
      delegate: this.db.project,
      pagination: filter.pagination,
      where,
    });
  }

  findByIdWithPhases(id: string): Promise<ProjectWithPhases | null> {
    return this.db.project.findUnique({
      where: { id },
      include: { phases: { orderBy: { order: 'asc' } } },
    });
  }

  async costTotals(projectId: string): Promise<ProjectCostTotalRow[]> {
    const rows = await this.db.projectCost.groupBy({
      by: ['phaseId', 'source'],
      where: { projectId },
      _sum: { amount: true },
    });

    return rows.map((row) => ({
      phaseId: row.phaseId,
      source: row.source,
      total: new Decimal((row._sum.amount ?? 0).toString()),
    }));
  }

  async taskStatusCounts(
    projectId: string
  ): Promise<ProjectTaskStatusCountRow[]> {
    const rows = await this.db.projectTask.groupBy({
      by: ['status'],
      where: { projectId },
      _count: { _all: true },
    });

    return rows.map((row) => ({
      status: row.status,
      count: row._count._all,
    }));
  }
}
