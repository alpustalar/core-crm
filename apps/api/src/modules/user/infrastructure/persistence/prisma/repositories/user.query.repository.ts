import { GlobalStatus, Prisma, User as PrismaUser } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { z } from 'zod';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IUserQueryRepository } from '@modules/user/domain/repositories/user.repository';
import { FindUsersByOrganizationIdsProps } from '@modules/user/domain/types/find-users-by-organization-ids.props';
import { FindUsersByClinicIdsProps } from '@modules/user/domain/types/find-users-by-clinic-ids.props';
import { User } from '@modules/user/domain/entities/user.entity';
import { UserSummary } from '@modules/user/domain/types/user-summary.type';
import { normalizeArray } from '@common/utils/normalize-array';

const NULL_USER_RELATIONS = {
  workingClinic: null,
  managedClinicIds: [],
  ownedOrganizationIds: [],
  providerProfileId: null,
};

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
      include: { role: true },
    });
    if (!raw) return null;
    return new User({ ...raw, ...NULL_USER_RELATIONS });
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.db.user.findFirst({
      where: { email },
      include: { role: true },
    });
    if (!raw) return null;
    return new User({ ...raw, ...NULL_USER_RELATIONS });
  }

  async findAllActiveByClinicId(clinicId: string): Promise<User[]> {
    const raws = await this.db.user.findMany({
      where: { clinicId, status: { not: GlobalStatus.DELETED } },
      include: { role: true },
    });
    return raws.map((raw) => new User({ ...raw, ...NULL_USER_RELATIONS }));
  }

  async findAllByClinicId(clinicId: string): Promise<User[]> {
    const raws = await this.db.user.findMany({
      where: { clinicId, status: { not: GlobalStatus.DELETED } },
      include: { role: true },
    });
    return raws.map((raw) => new User({ ...raw, ...NULL_USER_RELATIONS }));
  }

  checkEmailExists(email: string): Promise<number> {
    return this.db.user.count({ where: { email } });
  }

  findForAuth(firebaseUid: string) {
    return this.db.user.findFirst({
      where: {
        id: firebaseUid,
        status: GlobalStatus.ACTIVE,
      },
      include: {
        managedClinics: {
          select: { id: true },
        },
        ownedOrganizations: {
          select: { id: true },
        },
        providerProfile: {
          select: { id: true },
        },
        role: {
          include: {
            capabilities: {
              include: { capability: true },
            },
          },
        },
      },
    });
  }

  async list(pagination: Pagination, where?: Record<string, unknown>) {
    const result = await paginate<PrismaUser, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where: where as Prisma.UserWhereInput,
    });
    return this.mapPagination(
      result,
      (raw) => new User({ ...raw, role: null, ...NULL_USER_RELATIONS })
    );
  }

  listByOrganizationIds({
    pagination,
    organizationId,
  }: FindUsersByOrganizationIdsProps) {
    const organizationIds = normalizeArray(organizationId);
    return paginate<UserSummary, Prisma.UserWhereInput>({
      delegate: this.db.user as any,
      pagination,
      where: {
        workingClinic: { is: { organizationId: { in: organizationIds } } },
        status: { not: GlobalStatus.DELETED },
      },
      select: USER_SELECT,
    });
  }

  listByClinicIds({ pagination, clinicId }: FindUsersByClinicIdsProps) {
    const clinicIds = normalizeArray(clinicId);
    return paginate<UserSummary, Prisma.UserWhereInput>({
      delegate: this.db.user as any,
      pagination,
      where: {
        clinicId: { in: clinicIds },
        status: { not: GlobalStatus.DELETED },
      },
      select: USER_SELECT,
    });
  }
}
