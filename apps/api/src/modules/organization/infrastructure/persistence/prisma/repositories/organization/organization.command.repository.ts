import { Organization } from '@modules/organization/domain/entities/organization.entity';
import { IOrganizationCommandRepository } from '@modules/organization/domain/repositories/organization.repository.interface';
import { CreateOrganizationProps } from '@modules/organization/domain/types/create-organization.props';
import { UpdateOrganizationProps } from '@modules/organization/domain/types/update-organization.props';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class OrganizationCommandRepository
  extends BaseRepository
  implements IOrganizationCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateOrganizationProps): Promise<Organization> {
    const raw = await this.db.organization.create({ data });
    return new Organization(raw);
  }

  async updateByOwner(organizationId: string, data: UpdateOrganizationProps): Promise<Organization> {
    const raw = await this.db.organization.update({
      where: { id: organizationId },
      data,
    });
    return new Organization(raw);
  }

  async save(entity: Organization): Promise<void> {
    await this.db.organization.update({
      where: { id: entity.id },
      data: entity.toPersistence(),
    });
    entity.flushEvents();
  }

  async saveMany(entities: Organization[]): Promise<void> {
    await Promise.all(
      entities.map((entity) =>
        this.db.organization.update({
          where: { id: entity.id },
          data: entity.toPersistence(),
        })
      )
    );
    entities.forEach((entity) => entity.flushEvents());
  }
}
