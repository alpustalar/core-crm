import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProjectResourceAllocation } from '@modules/organization/project/domain/entities/project-resource-allocation.entity';
import { IProjectResourceAllocationCommandRepository } from '@modules/organization/project/domain/repositories/project-resource-allocation/project-resource-allocation.command.repository';
import {
  FindOverlappingAllocationsProps,
  LockResourceCapacityProps,
  OverlappingAllocation,
} from '@modules/organization/project/domain/contracts';
import { ProjectResourceKindSchema } from '@input-type-schemas/ProjectResourceKindSchema';

@Injectable()
export class ProjectResourceAllocationCommandRepository
  extends BaseRepository
  implements IProjectResourceAllocationCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(
    entity: ProjectResourceAllocation
  ): Promise<ProjectResourceAllocation> {
    const raw = await this.db.projectResourceAllocation.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new ProjectResourceAllocation(raw);
  }

  /**
   * Çapa kilidi kaynağın kendi satırındadır. `resourceId` EMPLOYEE'de
   * `employees`, ROOM/EQUIPMENT'ta `resources` satırını gösterir (şema notu).
   * Başka modüllerin tabloları ama burada veri OKUNMUYOR — yalnız aynı kaynağın
   * eşzamanlı tahsislerini sıraya sokan kilit alınıyor.
   *
   * `resourceId` kullanıcı girdisidir: var olmayan bir kaynak gönderildiğinde kilit
   * sessizce no-op kalır ve kapasite kuralı korumasız çalışırdı. `OrFail` bunu
   * `LockTargetMissingException`'a çevirir (422).
   */
  async lockResourceCapacity(props: LockResourceCapacityProps): Promise<void> {
    const table =
      props.kind === ProjectResourceKindSchema.enum.EMPLOYEE
        ? 'employees'
        : 'resources';

    await this.lockRowForUpdateOrFail(table, props.resourceId);
  }

  async findById(id: string): Promise<ProjectResourceAllocation | null> {
    const raw = await this.db.projectResourceAllocation.findUnique({
      where: { id },
    });
    return raw ? new ProjectResourceAllocation(raw) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.projectResourceAllocation.delete({ where: { id } });
  }

  /**
   * Kapalı aralık örtüşmesi: `start <= otherEnd && end >= otherStart`.
   * Bitiş günü ile ertesi tahsisin başlangıç günü çakışırsa örtüşme sayılır —
   * gün granülünde bir kaynak o gün ikiye bölünemez.
   */
  findOverlapping(
    props: FindOverlappingAllocationsProps
  ): Promise<OverlappingAllocation[]> {
    return this.db.projectResourceAllocation.findMany({
      where: {
        clinicId: props.clinicId,
        kind: props.kind,
        resourceId: props.resourceId,
        startDate: { lte: props.endDate },
        endDate: { gte: props.startDate },
        ...(props.excludeAllocationId
          ? { id: { not: props.excludeAllocationId } }
          : {}),
      },
      select: {
        id: true,
        projectId: true,
        startDate: true,
        endDate: true,
        allocationPercent: true,
      },
    });
  }
}
