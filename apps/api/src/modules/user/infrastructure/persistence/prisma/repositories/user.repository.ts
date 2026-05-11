import { Prisma, User, UserStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { z } from 'zod';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  FindUsersByClinicIdsInput,
  FindUsersByOrganizationIdsInput,
  IUserCreate,
  IUserRepository,
} from '@modules/user/domain/repositories/user.repository';

export const authUserInclude = Prisma.validator<Prisma.UserInclude>()({
  managedClinics: {
    select: { id: true, name: true },
  },
  ownedOrganizations: {
    select: { id: true, name: true },
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
});

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findOneWithAnIdOrEmail(userIdOrEmail: string) {
    const { success: isEmail } = z.email().safeParse(userIdOrEmail);
    if (isEmail) {
      return this.findByEmail(userIdOrEmail);
    }
    return this.findById(userIdOrEmail);
  }

  findById(id: string) {
    return this.db.user.findFirstOrThrow({ where: { id } });
  }

  findByEmail(email: string) {
    return this.db.user.findFirstOrThrow({ where: { email } });
  }

  checkEmailExists(email: string) {
    return this.db.user.count({ where: { email } });
  }

  findUserForAuth(where: Prisma.UserWhereInput) {
    return this.db.user.findFirst({ where, include: authUserInclude });
  }

  createUser(data: IUserCreate) {
    return this.db.user.create({ data });
  }

  softDeleteUserWithAnId(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { status: UserStatus.DELETED, deletedAt: new Date() },
    });
  }

  async updateUserWithAnId(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
    });
  }

  async changeAllUserStatusInClinicWithClinicId(
    clinicId: string,
    status: UserStatus
  ): Promise<{ deletedCount: number }> {
    const { count: deletedCount } = await this.db.user.updateMany({
      where: {
        clinicId: clinicId,
      },
      data: {
        status: status,
      },
    });
    return { deletedCount };
  }

  async softDeleteAllUsersByOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }> {
    const { count: deletedCount } = await this.db.user.updateMany({
      where: {
        workingClinic: { is: { organizationId } },
      } as Prisma.UserWhereInput,
      data: {
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      },
    });
    return { deletedCount };
  }

  async findAllUsers(pagination: Pagination, where?: Prisma.UserWhereInput) {
    return paginate<User, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where,
    });
  }

  findUsersByOrganizationIds({
    pagination,
    organizationId,
    extraWhere,
    select,
  }: FindUsersByOrganizationIdsInput) {
    const organizationIds = Array.isArray(organizationId)
      ? organizationId
      : [organizationId];

    return paginate<User, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where: {
        workingClinic: { is: { organizationId: { in: organizationIds } } },
        ...extraWhere,
      },
      select,
    });
  }

  findUsersByClinicIds({
    pagination,
    clinicId,
    extraWhere,
    select,
  }: FindUsersByClinicIdsInput) {
    const clinicIds = Array.isArray(clinicId) ? clinicId : [clinicId];

    return paginate<User, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where: {
        clinicId: { in: clinicIds },
        ...extraWhere,
      },
      select,
    });
  }
}
