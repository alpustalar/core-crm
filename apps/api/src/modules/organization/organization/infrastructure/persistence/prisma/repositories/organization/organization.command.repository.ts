import { Organization } from '@modules/organization/organization/domain/entities/organization.entity';
import { IOrganizationCommandRepository } from '@modules/organization/organization/domain/repositories/organization.repository.interface';
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

  async findById(id: string): Promise<Organization | null> {
    const raw = await this.db.organization.findUnique({ where: { id } });
    return raw ? new Organization(raw) : null;
  }

  async create(entity: Organization): Promise<Organization> {
    const data = entity.toPersistence();
    const raw = await this.db.organization.create({ data });
    entity.flushEvents();
    return new Organization(raw);
  }

  async update(entity: Organization): Promise<Organization> {
    const persistenceData = entity.toPersistence();
    const { id, ...data } = persistenceData;

    const raw = await this.db.organization.update({
      where: { id },
      data,
    });

    entity.flushEvents();
    return new Organization(raw);
  }

  async updateMany(entities: Organization[]): Promise<void> {
    const prismaQueries = entities.map((entity) => {
      const persistenceData = entity.toPersistence();
      const { id, ...data } = persistenceData;
      return this.db.organization.update({
        where: { id },
        data,
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
