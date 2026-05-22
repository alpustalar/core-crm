import { Clinic as ClinicEntity } from '@modules/clinic/domain/entities/clinic.entity';
import { IClinicCommandRepository } from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { ClinicPersistencePrismaMapper } from '@modules/clinic/infrastructure/persistence/prisma/mappers/clinic-persistence-prisma.mapper';
import { Injectable } from '@nestjs/common';
import { Clinic, GlobalStatus, Prisma } from '@prisma/client';
import { CreateClinicDto, UpdateClinicDto } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { UpdateAsManagerProps } from '@modules/clinic/domain/types/update-as-manager.props';

@Injectable()
export class ClinicCommandRepository
  extends BaseRepository
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

  async save(entity: ClinicEntity): Promise<void> {
    const data = entity.toPersistence();
    await this.db.clinic.update({
      where: { id: data.id },
      data,
    });
  }
}
