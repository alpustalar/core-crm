import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ClinicFinanceSettings } from '@modules/organization/clinic/domain/entities/clinic-finance-settings.entity';
import { IClinicFinanceSettingsQueryRepository } from '@modules/organization/clinic/domain/repositories/clinic-finance-settings.repository.interface';

@Injectable()
export class ClinicFinanceSettingsQueryRepository
  extends BaseRepository
  implements IClinicFinanceSettingsQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicFinanceSettings | null> {
    const raw = await this.db.clinicFinanceSettings.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicFinanceSettings(raw) : null;
  }
}
