import { PrismaService } from '../../prisma/prisma.service';
import { GlobalStatus, Prisma } from '@prisma/client';

export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.OrganizationCreateInput) {
    return this.prisma.organization.create({ data });
  }

  findOne(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  findFirstByOwnerCredentials(ownerId: string) {
    return this.prisma.organization.findFirst({
      where: this.whereWithOwnerCredentials(ownerId),
      orderBy: { createdAt: 'asc' },
    });
  }

  findOneByIdByOwner(ownerId: string, organizationId: string) {
    return this.prisma.organization.findFirst({
      where: this.whereWithId(ownerId, organizationId),
      orderBy: { createdAt: 'asc' },
    });
  }

  updateByOwner(organizationId: string, data: Prisma.OrganizationUpdateInput) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  }

  softDelete(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.organization.update({
      where: { id },
      data: {
        status: GlobalStatus.DELETED,
        deletedAt: new Date(),
      },
    });
  }

  whereWithId(ownerId: string, organizationId: string) {
    return {
      id: organizationId,
      deletedAt: null,
      organizationOwners: {
        some: {
          id: ownerId,
        },
      },
    };
  }

  whereWithOwnerCredentials(ownerId: string) {
    return {
      deletedAt: null,
      organizationOwners: {
        some: {
          id: ownerId,
        },
      },
    };
  }
}
