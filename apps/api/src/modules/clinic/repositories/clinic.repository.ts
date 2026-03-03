import { Injectable } from '@nestjs/common';
import { Clinic, GlobalStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClinicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClinicCreateInput) {
    return this.prisma.clinic.create({ data });
  }

  async FindByIdWithDetails(id: string) {
    return this.prisma.clinic.findUnique({
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
    return this.prisma.clinic.findUnique({
      where: { slug, status: { not: GlobalStatus.DELETED } },
    });
  }

  async update(id: string, data: Prisma.ClinicUpdateInput) {
    return this.prisma.clinic.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.clinic.update({
      where: { id },
      data: {
        status: GlobalStatus.DELETED,
        deletedAt: new Date(),
      },
    });
  }

  // ✅ Manager-specific queries
  async findByIdAsManager(id: string, userId: string): Promise<Clinic | null> {
    return this.prisma.clinic.findFirst({
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

  async softDeleteByOrganizationId(
    organizationId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.clinic.updateMany({
      where: { organizationId },
      data: { status: GlobalStatus.DELETED, deletedAt: new Date() },
    });
  }

  async updateAsManager(
    id: string,
    userId: string,
    data: Prisma.ClinicUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Clinic | null> {
    const client = tx ?? this.prisma;
    return client.clinic.update({
      where: { id, managers: { some: { id: userId } } },
      data,
    });
  }

  async findManyByOrganizationId(
    organizationId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return client.clinic.findMany({
      where: {
        organizationId,
        status: { not: GlobalStatus.DELETED },
      },
      orderBy: { name: 'asc' },
    });
  }

  async existsBySlug(slug: string) {
    const clinic = await this.prisma.clinic.findFirst({
      where: { slug, status: { not: GlobalStatus.DELETED } },
      select: { id: true },
    });

    return !!clinic;
  }

  async canUserManageClinic(
    clinicId: string,
    userId: string,
  ): Promise<boolean> {
    const manager = await this.prisma.clinic.findFirst({
      where: {
        id: clinicId,
        managers: { some: { id: userId } },
      },
    });
    return !!manager;
  }
}
