import { Injectable } from '@nestjs/common';
import { Organization as IOrganization } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IOrganizationQueryRepository } from '@modules/organization/organization/domain/repositories/organization/organization.query.repository';

@Injectable()
export class OrganizationQueryRepository
  extends BaseRepository
  implements IOrganizationQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findFirstByOwnerCredentials(ownerId: string): Promise<IOrganization | null> {
    return this.db.organization.findFirst({
      where: this.ownerWhere(ownerId),
      orderBy: { createdAt: 'asc' },
    });
  }

  async findIdByClinicId(clinicId: string) {
    const raw = await this.db.organization.findFirst({
      where: { clinics: { some: { id: clinicId } } },
      select: { id: true },
    });
    return raw ? raw.id : null;
  }

  findOneByIdByOwner(
    ownerId: string,
    organizationId: string
  ): Promise<IOrganization | null> {
    return this.db.organization.findFirst({
      where: {
        id: organizationId,
        ...this.ownerWhere(ownerId),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string): Promise<IOrganization | null> {
    return this.db.organization.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<IOrganization | null> {
    return this.db.organization.findUnique({ where: { slug } });
  }

  private ownerWhere(ownerId: string) {
    return {
      deletedAt: null,
      organizationOwners: { some: { id: ownerId } },
    };
  }
}
