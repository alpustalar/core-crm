import { Prisma } from '@prisma/client';

export class UserQueriesPrismaMapper {
  static findUsersSelect(): Prisma.UserSelect {
    return {
      id: true,
      displayName: true,
      email: true,
      picture: true,
      status: true,
      lastLogin: true,
      createdAt: true,
      role: {
        select: {
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
        },
      },
    };
  }

  static findUsersWhere(): Prisma.UserWhereInput {
    return {
      status: { not: 'DELETED' },
    };
  }
}
