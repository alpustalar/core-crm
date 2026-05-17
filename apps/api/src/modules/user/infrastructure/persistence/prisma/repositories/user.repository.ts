import { GlobalStatus, Prisma, User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { z } from 'zod';
import { Pagination } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { UserPersistencePrismaMapper } from '@modules/user/infrastructure/persistence/prisma/mappers/user-persistence.mapper';
import { CreateUserProps } from '@modules/user/domain/types/create-user.props';
import { UpdateUserProps } from '@modules/user/domain/types/update-user.props';
import { IUserRepository } from '@modules/user/domain/repositories/user.repository';
import { UserWithRolePriority } from '@modules/user/domain/types/user-with-role-priority.type';
import { FindUsersByOrganizationIdsProps } from '@modules/user/domain/types/find-users-by-organization-ids.props';
import { FindUsersByClinicIdsProps } from '@modules/user/domain/types/find-users-by-clinic-ids.props';

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByIdOrEmail(
    userIdOrEmail: string
  ): Promise<UserWithRolePriority | null> {
    const { success: isEmail } = z.email().safeParse(userIdOrEmail);
    if (isEmail) {
      return this.findByEmail(userIdOrEmail);
    }
    return this.find(userIdOrEmail);
  }

  find(id: string): Promise<UserWithRolePriority | null> {
    return this.db.user.findFirst({
      where: { id },
      include: {
        role: {
          select: {
            priority: true,
          },
        },
      },
    });
  }

  findByEmail(email: string): Promise<UserWithRolePriority | null> {
    return this.db.user.findFirst({
      where: { email },
      include: {
        role: {
          select: {
            priority: true,
          },
        },
      },
    });
  }

  checkEmailExists(email: string): Promise<number> {
    return this.db.user.count({ where: { email } });
  }

  findForAuth(firebaseUid: string) {
    const toPersistence =
      UserPersistencePrismaMapper.toFindForAuthQuery(firebaseUid);
    return this.db.user.findFirst(toPersistence);
  }

  create(data: CreateUserProps) {
    const toPersistence = UserPersistencePrismaMapper.toCreateUser(data);
    return this.db.user.create({ data: toPersistence });
  }

  softDelete(id: string) {
    return this.db.user.update({
      where: { id },
      data: { status: GlobalStatus.DELETED, deletedAt: new Date() },
    });
  }

  update(id: string, data: UpdateUserProps) {
    return this.db.user.update({
      where: { id },
      data: data as Prisma.UserUncheckedUpdateInput,
    });
  }

  async changeAllStatusByClinicId(
    clinicId: string,
    status: GlobalStatus
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

  async softDeleteAllByOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }> {
    const { count: deletedCount } = await this.db.user.updateMany({
      where: {
        workingClinic: { is: { organizationId } },
      } as Prisma.UserWhereInput,
      data: {
        status: GlobalStatus.DELETED,
        deletedAt: new Date(),
      },
    });
    return { deletedCount };
  }

  list(pagination: Pagination, where?: Record<string, unknown>) {
    return paginate<User, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where: where as Prisma.UserWhereInput,
    });
  }

  listByOrganizationIds({
    pagination,
    organizationId,
  }: FindUsersByOrganizationIdsProps) {
    const { where, select } =
      UserPersistencePrismaMapper.toListByOrganizationIdsQuery(organizationId);
    return paginate<User, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where,
      select,
    });
  }

  listByClinicIds({ pagination, clinicId }: FindUsersByClinicIdsProps) {
    const { where, select } =
      UserPersistencePrismaMapper.toListByClinicIdsQuery(clinicId);

    return paginate<User, Prisma.UserWhereInput>({
      delegate: this.db.user,
      pagination,
      where,
      select,
    });
  }
}
