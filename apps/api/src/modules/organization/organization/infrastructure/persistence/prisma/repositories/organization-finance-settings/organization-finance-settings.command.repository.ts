import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { OrganizationFinanceSettings } from '@modules/organization/organization/domain/entities/organization-finance-settings.entity';
import { IOrganizationFinanceSettingsCommandRepository } from '@modules/organization/organization/domain/repositories/organization-finance-settings.repository.interface';

@Injectable()
export class OrganizationFinanceSettingsCommandRepository
  extends BaseCommandRepository<OrganizationFinanceSettings>
  implements IOrganizationFinanceSettingsCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<OrganizationFinanceSettings | null> {
    const raw = await this.db.organizationFinanceSettings.findUnique({
      where: { id },
    });
    return raw ? new OrganizationFinanceSettings(raw) : null;
  }

  async create(
    entity: OrganizationFinanceSettings
  ): Promise<OrganizationFinanceSettings> {
    const data = entity.toPersistence();
    const raw = await this.db.organizationFinanceSettings.create({ data });
    return new OrganizationFinanceSettings(raw);
  }

  async save(
    entity: OrganizationFinanceSettings
  ): Promise<OrganizationFinanceSettings> {
    const data = entity.toPersistence();
    // 1:1 satellite → upsert anahtarı organizationId (unique). PK update payload'ından çıkar.
    const { id: _id, ...update } = data;
    const raw = await this.db.organizationFinanceSettings.update({
      where: { organizationId: data.organizationId },
      data: update,
    });
    return new OrganizationFinanceSettings(raw);
  }
}
