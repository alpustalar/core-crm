import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOneWithAnIdOrEmail(
    userIdOrEmail: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return await client.user.findFirstOrThrow({
      where: {
        ...(userIdOrEmail.includes('@')
          ? {
              email: userIdOrEmail,
            }
          : { id: userIdOrEmail }),
      },
    });
  }

  createUser(data: Prisma.UserCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.user.create({ data });
  }

  softDeleteUserWithAnId(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.user.update({
      where: { id: userId },
      data: { status: UserStatus.DELETED, deletedAt: new Date() },
    });
  }

  async findAllUsers(
    paginationParams: {
      skip: number;
      take: number;
      orderBy?: 'asc' | 'desc';
    },
    where?: Prisma.UserWhereInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    const [items, total] = await Promise.all([
      client.user.findMany({
        where,
        skip: paginationParams.skip,
        take: paginationParams.take,
        orderBy: { createdAt: paginationParams.orderBy ?? 'desc' },
      }),
      client.user.count({ where }),
    ]);

    return { items, total };
  }

  updateUserWithAnId(
    userId: string,
    data: Prisma.UserUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.user.update({
      where: { id: userId },
      data,
    });
  }

  changeAllUserStatusInClinicWithClinicId(
    clinicId: string,
    status: UserStatus,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.user.updateMany({
      where: {
        clinicId: clinicId,
      },
      data: {
        status: status,
      },
    });
  }

  updateUserSecurely(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    clinicId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    const secureWhere = clinicId ? { ...where, clinicId } : where;
    return client.user.update({
      where: secureWhere,
      data,
    });
  }
}
