import { User } from '@modules/identity/user/domain/entities/user.entity';
import { IUserCommandRepository } from '@modules/identity/user/domain/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  GlobalStatusSchema,
  GlobalStatusType,
} from '@input-type-schemas/GlobalStatusSchema';
import { normalizeArray } from '@common/utils/normalize-array';

@Injectable()
export class UserCommandRepository
  extends BaseCommandRepository<User>
  implements IUserCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.db.user.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, priority: true } },
        workingClinic: { select: { id: true } },
        managedClinics: { select: { id: true } },
        ownedOrganizations: { select: { id: true } },
        providerProfile: { select: { id: true } },
      },
    });

    if (!raw) return null;

    const { managedClinics, ownedOrganizations, providerProfile, ...rest } =
      raw;
    return new User({
      ...rest,
      managedClinicIds: managedClinics.map((c) => c.id),
      ownedOrganizationIds: ownedOrganizations.map((o) => o.id),
      providerProfileId: providerProfile?.id ?? null,
    });
  }

  async create(entity: User): Promise<User> {
    const data = entity.toPersistence();
    const raw = await this.db.user.create({
      data: {
        ...(data as Prisma.UserUncheckedCreateInput),
        ...(entity.managedClinicIds?.length && {
          managedClinics: {
            connect: entity.managedClinicIds.map((id) => ({ id: id.value })),
          },
        }),
        ...(entity.ownedOrganizationIds?.length && {
          ownedOrganizations: {
            connect: entity.ownedOrganizationIds.map((id) => ({
              id: id.value,
            })),
          },
        }),
      },
    });
    entity.flushEvents();
    return new User({
      ...raw,
      role: entity.role,
      workingClinic: entity.workingClinic,
      managedClinicIds: entity.managedClinicIds
        ? entity.managedClinicIds.map((id) => id.value)
        : [],
      ownedOrganizationIds: entity.ownedOrganizationIds
        ? entity.ownedOrganizationIds.map((id) => id.value)
        : [],
      providerProfileId: entity.providerProfileId?.value ?? null,
    });
  }

  async save(entity: User): Promise<User> {
    const create = entity.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.user.upsert({
      where: { id },
      create: {
        ...(create as Prisma.UserUncheckedCreateInput),
        ...(entity.managedClinicIds?.length && {
          managedClinics: {
            connect: entity.managedClinicIds.map((id) => ({ id: id.value })),
          },
        }),
        ...(entity.ownedOrganizationIds?.length && {
          ownedOrganizations: {
            connect: entity.ownedOrganizationIds.map((id) => ({
              id: id.value,
            })),
          },
        }),
      },
      update,
    });
    entity.flushEvents();
    return new User({
      ...raw,
      role: entity.role,
      workingClinic: entity.workingClinic,
      managedClinicIds: entity.managedClinicIds
        ? entity.managedClinicIds.map((id) => id.value)
        : [],

      ownedOrganizationIds: entity.ownedOrganizationIds
        ? entity.ownedOrganizationIds.map((id) => id.value)
        : [],
      providerProfileId: entity.providerProfileId?.value ?? null,
    });
  }

  updateLastLogin(id: string) {
    return this.db.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async changeStatus(
    status: GlobalStatusType,
    clinicId: string
  ): Promise<{ ids: string[]; deletedCount: number }> {
    const affected = await this.db.user.findMany({
      where: { workingClinic: { is: { id: clinicId } } },
      select: { id: true },
    });
    const ids = affected.map((u) => u.id);

    const batchPayload = await this.db.user.updateMany({
      where: { clinicId },
      data: { status },
    });

    return { ids, deletedCount: batchPayload.count };
  }

  async softDeleteAllByClinicIds(
    clinicId: string[] | string
  ): Promise<{ ids: string[]; deletedCount: number }> {
    const normalizedClinicId = normalizeArray(clinicId);

    const affected = await this.db.user.findMany({
      where: {
        workingClinic: {
          id: { in: normalizedClinicId },
        },
      },
      select: { id: true },
    });

    const ids = affected.map((u) => u.id);

    if (ids.length === 0) {
      return { ids: [], deletedCount: 0 };
    }

    const { count: deletedCount } = await this.db.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: GlobalStatusSchema.enum.DELETED,
        deletedAt: new Date(),
      },
    });

    return { ids, deletedCount };
  }
}
