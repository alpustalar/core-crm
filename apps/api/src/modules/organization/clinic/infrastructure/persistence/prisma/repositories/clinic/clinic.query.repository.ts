import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicQueryRepository } from '@modules/organization/clinic/domain/repositories/clinic.repository.interface';
import { Clinic as ClinicEntity } from '@modules/organization/clinic/domain/entities/clinic.entity';
import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';
import { ClinicDetails } from '@modules/organization/clinic/domain/contracts/clinic.contracts';

@Injectable()
export class ClinicQueryRepository
  extends BaseRepository
  implements IClinicQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ClinicEntity | null> {
    const raw = await this.db.clinic.findUnique({
      where: { id, status: { not: GlobalStatusSchema.enum.DELETED } },
    });
    return raw ? new ClinicEntity(raw) : null;
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

  async findBySlug(slug: string): Promise<ClinicEntity | null> {
    const raw = await this.db.clinic.findUnique({
      where: { slug, status: { not: GlobalStatusSchema.enum.DELETED } },
    });
    return raw ? new ClinicEntity(raw) : null;
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

  async findByIdAsManager(
    id: string,
    userId: string
  ): Promise<ClinicEntity | null> {
    const raw = await this.db.clinic.findFirst({
      where: {
        id,
        status: { not: GlobalStatusSchema.enum.DELETED },
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
        status: { not: GlobalStatusSchema.enum.DELETED },
      },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => new ClinicEntity(r));
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
