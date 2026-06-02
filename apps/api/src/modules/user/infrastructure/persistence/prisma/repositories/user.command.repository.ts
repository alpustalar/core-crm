import { User } from '@modules/user/domain/entities/user.entity';
import { IUserCommandRepository } from '@modules/user/domain/repositories/user.repository';
import { CreateUserProps } from '@modules/user/domain/types/create-user.props';
import { Injectable } from '@nestjs/common';
import { GlobalStatus, Prisma, User as PrismaUser } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { connect } from '@src/infrastructure/persistence/prisma/helpers';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';

@Injectable()
export class UserCommandRepository
  extends BaseRepository
  implements IUserCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(props: CreateUserProps): Promise<PrismaUser> {
    return this.db.user.create({
      data: {
        id: props.id,
        email: props.email,
        displayName: props.displayName,
        picture: props.picture,
        role: { connect: { id: props.roleId } },
        workingClinic: connect(props.clinicId),
        ...(props.ownedOrganizationIds?.length && {
          ownedOrganizations: {
            connect: props.ownedOrganizationIds.map((id) => ({ id })),
          },
        }),
        ...(props.managedClinicIds?.length && {
          managedClinics: {
            connect: props.managedClinicIds.map((id) => ({ id })),
          },
        }),
        ...(props.providerProfile && {
          providerProfile: {
            create: {
              title: connect(props.providerProfile.titleId),
              specialty: connect(props.providerProfile.specialtyId),
              clinic: { connect: { id: props.providerProfile.clinicId } },
              isActive: props.providerProfile.isActive,
              publicPhone: props.providerProfile.publicPhone,
              publicEmail: props.providerProfile.publicEmail,
            },
          },
        }),
      },
    });
  }

  async saveMany(users: User[]): Promise<void> {
    const prismaQueries = users.map((u) => {
      const data = u.toPersistence();
      return this.db.user.upsert({
        where: { id: u.id },
        create: data as Prisma.UserUncheckedCreateInput,
        update: data as Prisma.UserUncheckedUpdateInput,
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
      create: data as Prisma.UserUncheckedCreateInput,
      update: data as Prisma.UserUncheckedUpdateInput,
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
