import { Organization } from '@modules/organization/domain/entities/organization.entity';
import { IOrganizationCommandRepository } from '@modules/organization/domain/repositories/organization.repository.interface';
import { CreateOrganizationProps } from '@modules/organization/domain/types/create-organization.props';
import { UpdateOrganizationProps } from '@modules/organization/domain/types/update-organization.props';
import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class OrganizationCommandRepository
  extends BaseCommandRepository<Organization>
  implements IOrganizationCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateOrganizationProps): Promise<Organization> {
    const raw = await this.db.organization.create({ data });
    return new Organization(raw);
  }

  async updateByOwner(
    organizationId: string,
    data: UpdateOrganizationProps
  ): Promise<Organization> {
    const raw = await this.db.organization.update({
      where: { id: organizationId },
      data,
    });
    return new Organization(raw);
  }

  async save(entity: Organization): Promise<Organization> {
    const data = entity.toPersistence();

    // 1. Yeni açılan kurumlar için upsert zırhı ve güncel ham veri yakalama
    const raw = await this.db.organization.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });

    entity.flushEvents();
    return new Organization(raw);
  }

  async saveMany(entities: Organization[]): Promise<void> {
    const prismaQueries = entities.map((entity) => {
      const data = entity.toPersistence();
      return this.db.organization.upsert({
        where: { id: entity.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    entities.forEach((entity) => entity.flushEvents());
  }
}
