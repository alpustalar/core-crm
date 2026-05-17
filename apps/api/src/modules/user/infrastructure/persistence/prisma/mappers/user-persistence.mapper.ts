import { GlobalStatus, Prisma } from '@prisma/client';
import { UpdateUserByActorDto } from '@shared';
import { connect } from '@src/infrastructure/persistence/prisma/helpers';
import { CreateUserProps } from '@modules/user/domain/types/create-user.props';
import { normalizeArray } from '@common/utils/normalize-array';

export type ToFindUserByOrganizationIdsResult = {
  where: Prisma.UserWhereInput;
  select: Prisma.UserSelect;
};

export const USER_FIND_INCLUDE = {
  role: {
    select: {
      priority: true,
    },
  },
} as const satisfies Prisma.UserInclude;

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

export class UserPersistencePrismaMapper {
  static toCreateUser(props: CreateUserProps): Prisma.UserCreateInput {
    return {
      id: props.id,
      email: props.email,
      displayName: props.displayName,
      picture: props.picture,
      role: connect(props.roleId),
      workingClinic: connect(props.clinicId),
      ...(props.ownedOrganizationIds?.length && {
        ownedOrganizations: { connect: props.ownedOrganizationIds.map((id) => ({ id })) },
      }),
      ...(props.managedClinicIds?.length && {
        managedClinics: { connect: props.managedClinicIds.map((id) => ({ id })) },
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
    };
  }

  static toFind_withPriority(id: string) {
    return {
      where: {
        id,
        status: GlobalStatus.ACTIVE,
      },
      include: USER_FIND_INCLUDE,
    };
  }

  static toUpdate_withProviderProfileQuery(
    dto: UpdateUserByActorDto
  ): Prisma.UserUpdateInput {
    const { clinicId, titleId, specialtyId, providerProfile, roleId, ...rest } =
      dto;
    return {
      ...rest,
      role: connect(roleId),
      workingClinic: connect(clinicId),
      ...(providerProfile && {
        providerProfile: {
          ...(clinicId
            ? {
                upsert: {
                  update: {
                    publicPhone: providerProfile.publicPhone,
                    title: connect(titleId),
                    specialty: connect(specialtyId),
                    clinic: connect(clinicId),
                  },
                  create: {
                    publicPhone: providerProfile.publicPhone,
                    title: connect(titleId),
                    specialty: connect(specialtyId),
                    clinic: { connect: { id: clinicId } },
                  },
                },
              }
            : {
                update: {
                  publicPhone: providerProfile.publicPhone,
                  title: connect(titleId),
                  specialty: connect(specialtyId),
                },
              }),
        },
      }),
    };
  }

  static toListByOrganizationIdsQuery(
    organizationId: string[] | string
  ): ToFindUserByOrganizationIdsResult {
    const organizationIds = normalizeArray(organizationId);
    return {
      where: {
        workingClinic: { is: { organizationId: { in: organizationIds } } },
        status: { not: GlobalStatus.DELETED },
      },
      select: USER_SELECT,
    };
  }

  static toListByClinicIdsQuery(clinicId: string[] | string) {
    const clinicIds = Array.isArray(clinicId) ? clinicId : [clinicId];
    return {
      where: {
        clinicId: { in: clinicIds },
        status: { not: GlobalStatus.DELETED },
      },
      select: USER_SELECT,
    };
  }

  static toFindForAuthQuery(firebaseUid: string) {
    return {
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
    };
  }
}
