import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';
import { ClinicDetails } from '@modules/organization/clinic/domain/contracts/clinic.contracts';
import { IClinicQueryRepository } from '@modules/organization/clinic/domain/repositories/clinic/clinic.query.repository';
import { Clinic } from '@shared';

@Injectable()
export class ClinicQueryRepository
  extends BaseRepository
  implements IClinicQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<Clinic | null> {
    return this.db.clinic.findUnique({
      where: { id, status: { not: GlobalStatusSchema.enum.DELETED } },
    });
  }

  async findByIdWithDetails(id: string): Promise<ClinicDetails | null> {
    return this.db.clinic.findUnique({
      where: { id, status: { not: GlobalStatusSchema.enum.DELETED } },
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

  findBySlug(slug: string): Promise<Clinic | null> {
    return this.db.clinic.findUnique({
      where: { slug, status: { not: GlobalStatusSchema.enum.DELETED } },
    });
  }

  async findIdByPatientId(patientId: string): Promise<string | null> {
    const raw = await this.db.clinic.findFirst({
      where: { patients: { some: { id: patientId } } },
      select: { id: true },
    });
    return raw ? raw.id : null;
  }

  async findIdByProviderId(providerId: string): Promise<string | null> {
    const raw = await this.db.clinic.findFirst({
      where: { providers: { some: { id: providerId } } },
      select: { id: true },
    });
    return raw ? raw.id : null;
  }

  findByIdAsManager(id: string, userId: string): Promise<Clinic | null> {
    return this.db.clinic.findFirst({
      where: {
        id,
        status: { not: GlobalStatusSchema.enum.DELETED },
        managers: { some: { id: userId } },
      },
      include: { organization: true },
    });
  }

  findManyByOrganizationId(organizationId: string): Promise<Clinic[]> {
    return this.db.clinic.findMany({
      where: {
        organizationId,
        status: { not: GlobalStatusSchema.enum.DELETED },
      },
      orderBy: { name: 'asc' },
    });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const clinic = await this.db.clinic.findFirst({
      where: { slug, status: { not: GlobalStatusSchema.enum.DELETED } },
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
