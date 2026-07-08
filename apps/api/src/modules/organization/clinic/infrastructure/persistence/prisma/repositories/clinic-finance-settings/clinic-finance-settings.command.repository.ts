import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ClinicFinanceSettings } from '@modules/organization/clinic/domain/entities/clinic-finance-settings.entity';
import { IClinicFinanceSettingsCommandRepository } from '@modules/organization/clinic/domain/repositories/clinic-finance-settings.repository.interface';

@Injectable()
export class ClinicFinanceSettingsCommandRepository
  extends BaseCommandRepository<ClinicFinanceSettings>
  implements IClinicFinanceSettingsCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ClinicFinanceSettings | null> {
    const raw = await this.db.clinicFinanceSettings.findUnique({
      where: { id },
    });
    return raw ? new ClinicFinanceSettings(raw) : null;
  }

  async create(
    entity: ClinicFinanceSettings
  ): Promise<ClinicFinanceSettings> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicFinanceSettings.create({ data });
    return new ClinicFinanceSettings(raw);
  }

  async save(entity: ClinicFinanceSettings): Promise<ClinicFinanceSettings> {
    const data = entity.toPersistence();
    // 1:1 satellite → upsert anahtarı clinicId (unique). id PK olduğu için
    // update payload'ından çıkarılır (PK güncellenmez).
    const { id: _id, ...update } = data;
    const raw = await this.db.clinicFinanceSettings.upsert({
      where: { clinicId: data.clinicId },
      create: data,
      update,
    });
    return new ClinicFinanceSettings(raw);
  }
}
