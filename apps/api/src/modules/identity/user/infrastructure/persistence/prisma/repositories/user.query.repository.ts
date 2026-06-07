import { GlobalStatus, Prisma, User as PrismaUser } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { z } from 'zod';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IUserQueryRepository } from '@modules/identity/user/domain/repositories/user.repository';
import { FindUsersByOrganizationIdsProps } from '@modules/identity/user/domain/types/find-users-by-organization-ids.props';
import { FindUsersByClinicIdsProps } from '@modules/identity/user/domain/types/find-users-by-clinic-ids.props';
import { User } from '@modules/identity/user/domain/entities/user.entity';
import { UserSummary } from '@modules/identity/user/domain/types/user-summary.type';
import { PaginatedUsers } from '@modules/identity/user/domain/types/paginated-users.type';
import { AuthUserResponse } from '@modules/identity/user/domain/types/auth-user-response.type';
import { RoleWithCapabilities } from '@common/interfaces';
import { normalizeArray } from '@common/utils/normalize-array';

const USER_SELECT = {
  id: true,
  displayName: true,
  email: true,
  picture: true,
  status: true,
  lastLogin: true,
  createdAt: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
  workingClinic: {
    select: {
      id: true,
      name: true,
    },
  },
  providerProfile: {
    select: {
      id: true,
    },
  },
  managedClinics: {
    select: {
      id: true,
      name: true,
    },
  },
} as const satisfies Prisma.UserSelect;

const USER_FULL_INCLUDE = {
  role: true,
  workingClinic: true,
  managedClinics: { select: { id: true } },
  ownedOrganizations: { select: { id: true } },
  providerProfile: { select: { id: true } },
} as const satisfies Prisma.UserInclude;

function toUserEntity(
  raw: Prisma.UserGetPayload<{ include: typeof USER_FULL_INCLUDE }>
): User {
  return new User({
    ...raw,
    managedClinicIds: raw.managedClinics.map((c) => c.id),
    ownedOrganizationIds: raw.ownedOrganizations.map((o) => o.id),
    providerProfileId: raw.providerProfile?.id ?? null,
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
      include: USER_FULL_INCLUDE,
    });
    if (!raw) return null;
    return toUserEntity(raw);
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.db.user.findFirst({
      where: { email },
      include: USER_FULL_INCLUDE,
    });
    if (!raw) return null;
    return toUserEntity(raw);
  }

  async findAllActiveByClinicId(clinicId: string): Promise<User[]> {
    const raws = await this.db.user.findMany({
      where: { clinicId, status: { not: GlobalStatus.DELETED } },
      include: USER_FULL_INCLUDE,
    });
    return raws.map(toUserEntity);
  }

  async findAllByClinicId(clinicId: string): Promise<User[]> {
    const raws = await this.db.user.findMany({
      where: { clinicId },
      include: USER_FULL_INCLUDE,
    });
    return raws.map(toUserEntity);
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

  async list(pagination: Pagination, where?: Record<string, unknown>) {
    const result = await paginate<PrismaUser, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where: where as Prisma.UserWhereInput,
    });
    return this.mapPagination(
      result,
      (raw) =>
        new User({
          ...raw,
          role: null,
          workingClinic: null,
          managedClinicIds: [],
          ownedOrganizationIds: [],
          providerProfileId: null,
        })
    );
  }

  async listByOrganizationIds({
    pagination,
    organizationId,
  }: FindUsersByOrganizationIdsProps): Promise<PaginatedUsers> {
    const organizationIds = normalizeArray(organizationId);
    const result = await paginate<UserSummary, Prisma.UserWhereInput>({
      delegate: this.db.user as any,
      pagination,
      where: {
        workingClinic: { is: { organizationId: { in: organizationIds } } },
        status: { not: GlobalStatus.DELETED },
      },
      select: USER_SELECT,
    });
    return this.mapPagination(result);
  }

  async listByClinicIds({
    pagination,
    clinicId,
  }: FindUsersByClinicIdsProps): Promise<PaginatedUsers> {
    const clinicIds = normalizeArray(clinicId);
    const result = await paginate<UserSummary, Prisma.UserWhereInput>({
      delegate: this.db.user as any,
      pagination,
      where: {
        clinicId: { in: clinicIds },
        status: { not: GlobalStatus.DELETED },
      },
      select: USER_SELECT,
    });
    return this.mapPagination(result);
  }
}
