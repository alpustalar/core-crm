import { GlobalStatus, Prisma } from '@prisma/client';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { z } from 'zod';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IUserQueryRepository } from '@modules/identity/user/domain/repositories/user.repository';
import { User } from '@modules/identity/user/domain/entities/user.entity';
import { RoleWithCapabilities } from '@common/interfaces';
import { Paginated } from '@common/interfaces/paginated.type';
import { normalizeArray } from '@common/utils/normalize-array';
import {
  AuthUserResponse,
  FindUsersByClinicIdsFilter,
  FindUsersByOrganizationIdsFilter,
} from '@modules/identity/user/domain/user.contracts';

const USER_ENTITY_INCLUDE = {
  role: { select: { id: true, priority: true } },
  workingClinic: { select: { id: true } },
  managedClinics: { select: { id: true } },
  ownedOrganizations: { select: { id: true } },
  providerProfile: { select: { id: true } },
} as const satisfies Prisma.UserInclude;

function toUserEntity(
  raw: Prisma.UserGetPayload<{ include: typeof USER_ENTITY_INCLUDE }>
): User {
  const { managedClinics, ownedOrganizations, providerProfile, ...rest } = raw;
  return new User({
    ...rest,
    managedClinicIds: managedClinics.map((c) => c.id),
    ownedOrganizationIds: ownedOrganizations.map((o) => o.id),
    providerProfileId: providerProfile?.id ?? null,
  });
}

@Injectable()
export class UserQueryRepository
  extends BaseRepository
  implements IUserQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByIdOrEmail(userIdOrEmail: string): Promise<User | null> {
    const { success: isEmail } = z.email().safeParse(userIdOrEmail);
    if (isEmail) {
      return this.findByEmail(userIdOrEmail);
    }
    return this.find(userIdOrEmail);
  }

  async find(id: string): Promise<User | null> {
    const raw = await this.db.user.findFirst({
      where: { id },
      include: USER_ENTITY_INCLUDE,
    });
    if (!raw) return null;
    return toUserEntity(raw);
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.db.user.findFirst({
      where: { email },
      include: USER_ENTITY_INCLUDE,
    });
    if (!raw) return null;
    return toUserEntity(raw);
  }

  async findAllActiveByClinicId(clinicId: string): Promise<Paginated<User>> {
    const raws = await this.db.user.findMany({
      where: { clinicId, status: { not: GlobalStatus.DELETED } },
      include: USER_ENTITY_INCLUDE,
    });
    const items = raws.map(toUserEntity);
    return { items, total: items.length };
  }

  async findAllByStatusWithClinicId(
    status: GlobalStatusType,
    clinicId: string
  ): Promise<Paginated<User>> {
    const raws = await this.db.user.findMany({
      where: { clinicId, status },
      include: USER_ENTITY_INCLUDE,
    });
    const items = raws.map(toUserEntity);
    return { items, total: items.length };
  }

  async findAllByClinicId(clinicId: string): Promise<Paginated<User>> {
    const raws = await this.db.user.findMany({
      where: { clinicId },
      include: USER_ENTITY_INCLUDE,
    });
    const items = raws.map(toUserEntity);
    return { items, total: items.length };
  }

  checkEmailExists(email: string): Promise<number> {
    return this.db.user.count({ where: { email } });
  }

  async findForAuth(firebaseUid: string): Promise<AuthUserResponse | null> {
    const raw = await this.db.user.findFirst({
      where: { id: firebaseUid, status: GlobalStatus.ACTIVE },
      include: {
        managedClinics: { select: { id: true } },
        ownedOrganizations: { select: { id: true } },
        providerProfile: { select: { id: true } },
        role: {
          include: {
            capabilities: { include: { capability: true } },
          },
        },
      },
    });
    if (!raw) return null;
    return {
      id: raw.id,
      displayName: raw.displayName,
      email: raw.email,
      emailVerified: raw.emailVerified,
      status: raw.status,
      roleId: raw.roleId,
      picture: raw.picture,
      clinicId: raw.clinicId,
      lastLogin: raw.lastLogin,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
      managedClinics: raw.managedClinics,
      ownedOrganizations: raw.ownedOrganizations,
      providerProfile: raw.providerProfile,
      role: raw.role as RoleWithCapabilities | null,
    };
  }

  async list(
    pagination: Pagination,
    where?: Record<string, unknown>
  ): Promise<Paginated<User>> {
    const result = await paginate<
      Prisma.UserGetPayload<{ include: typeof USER_ENTITY_INCLUDE }>,
      Prisma.UserWhereInput
    >({
      delegate: this.db.user as never,
      pagination,
      where: where as Prisma.UserWhereInput,
      include: USER_ENTITY_INCLUDE,
    });
    return this.mapPagination(result, toUserEntity);
  }

  async listByOrganizationIds({
    pagination,
    organizationId,
  }: FindUsersByOrganizationIdsFilter): Promise<Paginated<User>> {
    const organizationIds = normalizeArray(organizationId);
    const result = await paginate<
      Prisma.UserGetPayload<{ include: typeof USER_ENTITY_INCLUDE }>,
      Prisma.UserWhereInput
    >({
      delegate: this.db.user as never,
      pagination,
      where: {
        workingClinic: { is: { organizationId: { in: organizationIds } } },
        status: { not: GlobalStatus.DELETED },
      },
      include: USER_ENTITY_INCLUDE,
    });
    return this.mapPagination(result, toUserEntity);
  }

  async listByClinicIds({
    pagination,
    clinicId,
  }: FindUsersByClinicIdsFilter): Promise<Paginated<User>> {
    const clinicIds = normalizeArray(clinicId);
    const result = await paginate<
      Prisma.UserGetPayload<{ include: typeof USER_ENTITY_INCLUDE }>,
      Prisma.UserWhereInput
    >({
      delegate: this.db.user as never,
      pagination,
      where: {
        clinicId: { in: clinicIds },
        status: { not: GlobalStatus.DELETED },
      },
      include: USER_ENTITY_INCLUDE,
    });
    return this.mapPagination(result, toUserEntity);
  }
}
