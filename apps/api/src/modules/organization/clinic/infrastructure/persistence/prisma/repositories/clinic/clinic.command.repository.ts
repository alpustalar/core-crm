import { Clinic as ClinicEntity } from '@modules/organization/clinic/domain/entities/clinic.entity';
import { IClinicCommandRepository } from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import { Injectable } from '@nestjs/common';
import { GlobalStatus, Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';

@Injectable()
export class ClinicCommandRepository
  extends BaseCommandRepository<ClinicEntity>
  implements IClinicCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async softDeleteManyClinicWithAnOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }> {
    const { count: deletedCount } = await this.db.clinic.updateMany({
      where: { organizationId, status: { not: GlobalStatus.DELETED } },
      data: { status: GlobalStatus.DELETED, deletedAt: new Date() },
    });
    return { deletedCount };
  }

  async save(entity: ClinicEntity): Promise<ClinicEntity> {
    const data = entity.toPersistence();
    const raw = await this.db.clinic.upsert({
      where: { id: data.id },
      create: data as Prisma.ClinicUncheckedCreateInput,
      update: data as Prisma.ClinicUncheckedUpdateInput,
    });
    entity.flushEvents();
    return new ClinicEntity(raw);
  }

  async saveMany(entities: ClinicEntity[]): Promise<void> {
    const prismaQueries = entities.map((entity) => {
      const data = entity.toPersistence();
      return this.db.clinic.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    entities.forEach((entity) => entity.flushEvents());
  }
}
