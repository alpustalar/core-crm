import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { OrganizationFinanceSettings } from '@modules/organization/organization/domain/entities/organization-finance-settings.entity';
import { IOrganizationFinanceSettingsQueryRepository } from '@modules/organization/organization/domain/repositories/organization-finance-settings.repository.interface';

@Injectable()
export class OrganizationFinanceSettingsQueryRepository
  extends BaseRepository
  implements IOrganizationFinanceSettingsQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByOrganizationId(
    organizationId: string
  ): Promise<OrganizationFinanceSettings | null> {
    const raw = await this.db.organizationFinanceSettings.findUnique({
      where: { organizationId },
    });
    return raw ? new OrganizationFinanceSettings(raw) : null;
  }
}
