import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IProjectResourceAllocationQueryRepository } from '@modules/organization/project/domain/repositories/project-resource-allocation/project-resource-allocation.query.repository';
import {
  FindResourceScheduleFilter,
  ResourceScheduleRow,
} from '@modules/organization/project/domain/contracts/project.contracts';

@Injectable()
export class ProjectResourceAllocationQueryRepository
  extends BaseRepository
  implements IProjectResourceAllocationQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findSchedule(
    filter: FindResourceScheduleFilter
  ): Promise<ResourceScheduleRow[]> {
    const where: Prisma.ProjectResourceAllocationWhereInput = {
      clinicId: filter.clinicId,
      startDate: { lte: filter.to },
      endDate: { gte: filter.from },
      ...(filter.kind ? { kind: filter.kind } : {}),
      ...(filter.resourceId ? { resourceId: filter.resourceId } : {}),
    };

    // Proje adı takvimde satır etiketi olarak gösteriliyor; aynı modülün kendi
    // ilişkisi olduğu için include sınır ihlali değildir.
    const rows = await this.db.projectResourceAllocation.findMany({
      where,
      select: {
        id: true,
        projectId: true,
        phaseId: true,
        kind: true,
        resourceId: true,
        startDate: true,
        endDate: true,
        allocationPercent: true,
        note: true,
        project: { select: { name: true } },
      },
      orderBy: [{ startDate: 'asc' }, { resourceId: 'asc' }],
    });

    return rows.map((row) => ({
      allocationId: row.id,
      projectId: row.projectId,
      projectName: row.project.name,
      phaseId: row.phaseId,
      kind: row.kind,
      resourceId: row.resourceId,
      startDate: row.startDate,
      endDate: row.endDate,
      allocationPercent: row.allocationPercent,
      note: row.note,
    }));
  }
}
