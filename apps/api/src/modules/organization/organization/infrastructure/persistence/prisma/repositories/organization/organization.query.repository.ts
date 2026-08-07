import { Injectable } from '@nestjs/common';
import { Organization as IOrganization } from '@shared';
import { IOrganizationQueryRepository } from '@modules/organization/organization/domain/repositories/organization.repository.interface';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
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

  private ownerWhere(ownerId: string) {
    return {
      deletedAt: null,
      organizationOwners: { some: { id: ownerId } },
    };
  }
}
