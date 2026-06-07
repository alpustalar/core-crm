export class OrganizationPersistenceMapper {
  static toFindOneByIdByOwner(ownerId: string, organizationId: string) {
    return {
      where: {
        id: organizationId,
        deletedAt: null,
        organizationOwners: {
          some: {
            id: ownerId,
          },
        },
      },
      orderBy: { createdAt: 'asc' as const },
    };
  }

  static toFindFirstByOwnerCredentials(ownerId: string) {
    return {
      where: {
        deletedAt: null,
        organizationOwners: {
          some: {
            id: ownerId,
          },
        },
      },
      orderBy: { createdAt: 'asc' as const },
    };
  }
}
