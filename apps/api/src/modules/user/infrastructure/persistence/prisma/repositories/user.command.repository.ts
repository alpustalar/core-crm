import { User } from '@modules/user/domain/entities/user.entity';
import { IUserCommandRepository } from '@modules/user/domain/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { GlobalStatus, Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';

@Injectable()
export class UserCommandRepository
  extends BaseCommandRepository<User>
  implements IUserCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async saveMany(users: User[]): Promise<void> {
    const prismaQueries = users.map((u) => {
      const data = u.toPersistence();
      return this.db.user.upsert({
        where: { id: u.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    users.forEach((u) => u.flushEvents());
  }

  async save(entity: User): Promise<User> {
    const data = entity.toPersistence();
    const raw = await this.db.user.upsert({
      where: { id: entity.id },
      create: {
        ...(data as Prisma.UserUncheckedCreateInput),
        ...(entity.managedClinicIds?.length && {
          managedClinics: {
            connect: entity.managedClinicIds.map((id) => ({ id })),
          },
        }),
        ...(entity.ownedOrganizationIds?.length && {
          ownedOrganizations: {
            connect: entity.ownedOrganizationIds.map((id) => ({ id })),
          },
        }),
      },
      update: data,
    });
    entity.flushEvents();
    return new User({
      ...raw,
      role: entity.role,
      workingClinic: entity.workingClinic,
      managedClinicIds: entity.managedClinicIds ?? [],
      ownedOrganizationIds: entity.ownedOrganizationIds ?? [],
      providerProfileId: entity.providerProfileId,
    });
  }

  updateLastLogin(id: string) {
    return this.db.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async softDeleteAllByOrganizationId(
    organizationId: string
  ): Promise<{ ids: string[]; deletedCount: number }> {
    const where = {
      workingClinic: { is: { organizationId } },
    } as Prisma.UserWhereInput;
    const affected = await this.db.user.findMany({
      where,
      select: { id: true },
    });
    const ids = affected.map((u) => u.id);
    const { count: deletedCount } = await this.db.user.updateMany({
      where,
      data: { status: GlobalStatus.DELETED, deletedAt: new Date() },
    });
    return { ids, deletedCount };
  }
}
