import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { GlobalStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { CreateOrganizationProps } from '@modules/organization/domain/types/create-organization.props';
import { UpdateOrganizationProps } from '@modules/organization/domain/types/update-organization.props';
import { IOrganizationRepository } from '@modules/organization/domain/repositories/organization.repository.interface';

export class OrganizationRepository
  extends BaseRepository
  implements IOrganizationRepository
{
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  create(data: CreateOrganizationProps) {
    return this.db.organization.create({ data });
  }

  findOneWithAnId(id: string) {
    return this.db.organization.findUnique({ where: { id } });
  }

  findOneWithASlug(slug: string) {
    return this.db.organization.findUniqueOrThrow({ where: { slug } });
  }

  findFirstByOwnerCredentials(ownerId: string) {
    return this.db.organization.findFirst({
      where: this.whereWithOwnerCredentials(ownerId),
      orderBy: { createdAt: 'asc' },
    });
  }

  findOneByIdByOwner(ownerId: string, organizationId: string) {
    return this.db.organization.findFirst({
      where: this.whereWithId(ownerId, organizationId),
      orderBy: { createdAt: 'asc' },
    });
  }

  updateByOwner(organizationId: string, data: UpdateOrganizationProps) {
    return this.db.organization.update({
      where: { id: organizationId },
      data,
    });
  }

  softDelete(id: string) {
    return this.db.organization.update({
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
