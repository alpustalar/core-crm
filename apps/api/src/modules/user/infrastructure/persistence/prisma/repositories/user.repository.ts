import { Prisma, User, UserStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { z } from 'zod';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/paginate.helper';

@Injectable()
export class UserRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findOneWithAnIdOrEmail(userIdOrEmail: string) {
    const { success: isEmail } = z.email().safeParse(userIdOrEmail);
    if (isEmail) {
      return await this.findByEmail(userIdOrEmail);
    }
    return await this.findById(userIdOrEmail);
  }

  findById(id: string) {
    return this.db.user.findFirstOrThrow({ where: { id } });
  }

  findByEmail(email: string) {
    return this.db.user.findFirstOrThrow({ where: { email } });
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.db.user.create({ data });
  }

  softDeleteUserWithAnId(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { status: UserStatus.DELETED, deletedAt: new Date() },
    });
  }

  updateUserWithAnId(userId: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id: userId },
      data,
    });
  }

  changeAllUserStatusInClinicWithClinicId(
    clinicId: string,
    status: UserStatus
  ) {
    return this.db.user.updateMany({
      where: {
        clinicId: clinicId,
      },
      data: {
        status: status,
      },
    });
  }

  async findAllUsers(pagination: Pagination, where?: Prisma.UserWhereInput) {
    return paginate<User, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where,
    });
  }

  async updateUserSecurely({
    where,
    data,
    clinicId,
  }: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
    clinicId?: string;
  }) {
    const secureWhere = clinicId
      ? { ...where, workingClinic: { id: clinicId } }
      : where;

    return await this.db.user.update({
      where: secureWhere,
      data,
    });
  }
}
