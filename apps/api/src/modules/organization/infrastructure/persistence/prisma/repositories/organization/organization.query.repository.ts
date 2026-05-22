import { Injectable } from '@nestjs/common';
import { Organization } from '@modules/organization/domain/entities/organization.entity';
import {
  IOrganizationQueryRepository
} from '@modules/organization/domain/repositories/organization.repository.interface';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class OrganizationQueryRepository
  extends BaseRepository
  implements IOrganizationQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Organization | null> {
    const raw = await this.db.organization.findUnique({ where: { id } });
    return raw ? new Organization(raw) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const raw = await this.db.organization.findUnique({ where: { slug } });
    return raw ? new Organization(raw) : null;
  }

  async findFirstByOwnerCredentials(
    ownerId: string
  ): Promise<Organization | null> {
    const raw = await this.db.organization.findFirst({
      where: this.ownerWhere(ownerId),
      orderBy: { createdAt: 'asc' },
    });
    return raw ? new Organization(raw) : null;
  }

  async findOneByIdByOwner(
    ownerId: string,
    organizationId: string
  ): Promise<Organization | null> {
    const raw = await this.db.organization.findFirst({
      where: {
        id: organizationId,
        ...this.ownerWhere(ownerId),
      },
      orderBy: { createdAt: 'asc' },
    });
    return raw ? new Organization(raw) : null;
  }

  private ownerWhere(ownerId: string) {
    return {
      deletedAt: null,
      organizationOwners: { some: { id: ownerId } },
    };
  }
}
