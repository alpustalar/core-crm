import { GlobalStatus, Prisma, User as PrismaUser } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { CreateUserProps } from '@modules/user/domain/types/create-user.props';
import { UpdateUserProps } from '@modules/user/domain/types/update-user.props';
import { IUserCommandRepository } from '@modules/user/domain/repositories/user.repository';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { connect } from '@src/infrastructure/persistence/prisma/helpers';

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

  update(id: string, data: UpdateUserProps): Promise<PrismaUser> {
    return this.db.user.update({
      where: { id },
      data: data as Prisma.UserUncheckedUpdateInput,
    });
  }

  softDelete(id: string): Promise<PrismaUser> {
    return this.db.user.update({
      where: { id },
      data: { status: GlobalStatus.DELETED, deletedAt: new Date() },
    });
  }

  async changeAllStatusByClinicId(
    clinicId: string,
    status: GlobalStatusType
  ): Promise<{ deletedCount: number }> {
    const { count: deletedCount } = await this.db.user.updateMany({
      where: { clinicId },
      data: { status },
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
}
