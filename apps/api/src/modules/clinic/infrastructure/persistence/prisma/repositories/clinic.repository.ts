import { Injectable } from '@nestjs/common';
import { Clinic, GlobalStatus, Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class ClinicRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: Prisma.ClinicCreateInput) {
    return this.db.clinic.create({ data });
  }

  async FindByIdWithDetails(id: string) {
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
            doctors: true,
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

  async update(id: string, data: Prisma.ClinicUpdateInput) {
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
  async findByIdAsManager(id: string, userId: string): Promise<Clinic | null> {
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

  async softDeleteByOrganizationId(organizationId: string) {
    return this.db.clinic.updateMany({
      where: { organizationId },
      data: { status: GlobalStatus.DELETED, deletedAt: new Date() },
    });
  }

  async updateAsManager({
    id,
    userId,
    data,
  }: {
    id: string;
    userId: string;
    data: Prisma.ClinicUpdateInput;
  }): Promise<Clinic | null> {
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
