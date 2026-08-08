import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

import { IClinicFinanceSettingsQueryRepository } from '@modules/organization/clinic/domain/repositories/clinic-finance-settings/clinic-finance-settings.query.repository';
import { ClinicFinanceSettings } from '@shared';

@Injectable()
export class ClinicFinanceSettingsQueryRepository
  extends BaseRepository
  implements IClinicFinanceSettingsQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<ClinicFinanceSettings | null> {
    return this.db.clinicFinanceSettings.findUnique({
      where: { clinicId },
    });
  }
}
