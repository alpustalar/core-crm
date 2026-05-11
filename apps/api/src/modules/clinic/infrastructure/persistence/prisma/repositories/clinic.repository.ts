import { Injectable } from '@nestjs/common';
import { Clinic, GlobalStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  IClinic,
  IClinicCreate,
  IClinicRepository,
  IClinicUpdate,
  UpdateAsManagerInput,
} from '@modules/clinic/domain/repositories/clinic.repository.interface';

@Injectable()
export class ClinicRepository
  extends BaseRepository
  implements IClinicRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: IClinicCreate) {
    return this.db.clinic.create({ data });
  }

  async findByIdWithDetails(id: string) {
    return this.db.clinic.findUnique({
      where: { id, status: { not: GlobalStatus.DELETED } },
      include: {
        organization: true,
        managers: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        _count: {
          select: {
            providers: true,
            patients: true,
            appointments: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.db.clinic.findUnique({
      where: { slug, status: { not: GlobalStatus.DELETED } },
    });
  }

  async update(id: string, data: IClinicUpdate) {
    return this.db.clinic.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.db.clinic.update({
      where: { id },
      data: {
        status: GlobalStatus.DELETED,
        deletedAt: new Date(),
      },
    });
  }

  // ✅ Manager-specific queries
  async findByIdAsManager(id: string, userId: string): Promise<IClinic | null> {
    return this.db.clinic.findFirst({
      where: {
        id,
        status: { not: GlobalStatus.DELETED },
        managers: { some: { id: userId } },
      },
      include: {
        organization: true,
        managers: true,
      },
    });
  }

  async softDeleteManyClinicWithAnOrganizationId(organizationId: string) {
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
  }: UpdateAsManagerInput): Promise<Clinic | null> {
    return this.db.clinic.update({
      where: { id, managers: { some: { id: userId } } },
      data,
    });
  }

  async findManyByOrganizationId(organizationId: string) {
    return this.db.clinic.findMany({
      where: {
        organizationId,
        status: { not: GlobalStatus.DELETED },
      },
      orderBy: { name: 'asc' },
    });
  }

  async existsBySlug(slug: string) {
    const clinic = await this.db.clinic.findFirst({
      where: { slug, status: { not: GlobalStatus.DELETED } },
      select: { id: true },
    });
    return !!clinic;
  }

  async canUserManageClinic(
    clinicId: string,
    userId: string
  ): Promise<boolean> {
    const manager = await this.db.clinic.findFirst({
      where: {
        id: clinicId,
        managers: { some: { id: userId } },
      },
    });
    return !!manager;
  }
}
