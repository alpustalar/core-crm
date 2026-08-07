import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { OrganizationFinanceSettings as IOrganizationFinanceSettings } from '@shared';
import { IOrganizationFinanceSettingsQueryRepository } from '@modules/organization/organization/domain/repositories/organization-finance-settings.repository.interface';

@Injectable()
export class OrganizationFinanceSettingsQueryRepository
  extends BaseRepository
  implements IOrganizationFinanceSettingsQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByOrganizationId(
    organizationId: string
  ): Promise<IOrganizationFinanceSettings | null> {
    return this.db.organizationFinanceSettings.findUnique({
      where: { organizationId },
    });
  }
}
