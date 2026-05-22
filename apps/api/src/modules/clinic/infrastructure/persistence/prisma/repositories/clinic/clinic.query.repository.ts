import { Injectable } from '@nestjs/common';
import { GlobalStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicQueryRepository } from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { Clinic as ClinicEntity } from '@modules/clinic/domain/entities/clinic.entity';
import { ClinicDetails } from '@modules/clinic/domain/types/clinic-details.type';

@Injectable()
export class ClinicQueryRepository
  extends BaseRepository
  implements IClinicQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByIdWithDetails(id: string): Promise<ClinicDetails | null> {
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

  async findBySlug(slug: string): Promise<ClinicEntity | null> {
    const raw = await this.db.clinic.findUnique({
      where: { slug, status: { not: GlobalStatus.DELETED } },
    });
    return raw ? new ClinicEntity(raw) : null;
  }

  async findByIdAsManager(
    id: string,
    userId: string
  ): Promise<ClinicEntity | null> {
    const raw = await this.db.clinic.findFirst({
      where: {
        id,
        status: { not: GlobalStatus.DELETED },
        managers: { some: { id: userId } },
      },
      include: { organization: true },
    });
    return raw ? new ClinicEntity(raw) : null;
  }

  async findManyByOrganizationId(
    organizationId: string
  ): Promise<ClinicEntity[]> {
    const rows = await this.db.clinic.findMany({
      where: {
        organizationId,
        status: { not: GlobalStatus.DELETED },
      },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => new ClinicEntity(r));
  }

  async existsBySlug(slug: string): Promise<boolean> {
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
