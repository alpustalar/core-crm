import { Clinic as ClinicEntity } from '@modules/organization/clinic/domain/entities/clinic.entity';
import { IClinicCommandRepository } from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import { ClinicPersistencePrismaMapper } from '@modules/organization/clinic/infrastructure/persistence/prisma/mappers/clinic-persistence-prisma.mapper';
import { Injectable } from '@nestjs/common';
import { Clinic, GlobalStatus, Prisma } from '@prisma/client';
import { CreateClinicDto, UpdateClinicDto } from '@shared';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import { UpdateAsManagerProps } from '@modules/organization/clinic/domain/types/update-as-manager.props';

@Injectable()
export class ClinicCommandRepository
  extends BaseCommandRepository<ClinicEntity>
  implements IClinicCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateClinicDto): Promise<Clinic> {
    const toPersistence =
      ClinicPersistencePrismaMapper.toCreateClinicInput(data);
    return this.db.clinic.create({ data: toPersistence });
  }

  async update(id: string, data: UpdateClinicDto): Promise<Clinic> {
    return this.db.clinic.update({
      where: { id },
      data: data as Prisma.ClinicUpdateInput,
    });
  }

  async softDelete(id: string): Promise<Clinic> {
    return this.db.clinic.update({
      where: { id },
      data: {
        status: GlobalStatus.DELETED,
        deletedAt: new Date(),
      },
    });
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

  async updateAsManager({
    id,
    userId,
    data,
  }: UpdateAsManagerProps): Promise<Clinic | null> {
    return this.db.clinic.update({
      where: { id, managers: { some: { id: userId } } },
      data: data as Prisma.ClinicUpdateInput,
    });
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
