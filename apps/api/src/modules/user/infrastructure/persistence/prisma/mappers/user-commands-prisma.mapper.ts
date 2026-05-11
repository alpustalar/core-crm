// user-prisma.mapper.ts
import { Prisma } from '@prisma/client';
import { CreateUserDto, UpdateUserByActorDto } from '@shared';
import { connect } from '@src/infrastructure/persistence/prisma/helpers';

export class UserCommandsPrismaMapper {
  static toUpdateUserWithAnIdInput(
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

  static toCreateUserInput(
    firebaseUid: string,
    dto: CreateUserDto,
    clinicId?: string
  ): Prisma.UserCreateInput {
    return {
      id: firebaseUid,
      email: dto.email,
      displayName: dto.displayName,
      workingClinic: connect(clinicId),
      role: connect(dto.roleId),
      ...(dto.providerProfile && {
        providerProfile: {
          create: {
            title: connect(dto.providerProfile.titleId),
            specialty: connect(dto.providerProfile.specialtyId),
            publicEmail: dto.providerProfile.publicEmail,
            publicPhone: dto.providerProfile.publicPhone,
            isActive: dto.providerProfile.isActive,
            clinic: { connect: { id: clinicId } },
          },
        },
      }),
    };
  }
}
