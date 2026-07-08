import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ClinicAppointmentSettings } from '@modules/organization/clinic/domain/entities/clinic-appointment-settings.entity';
import { IClinicAppointmentSettingsCommandRepository } from '@modules/organization/clinic/domain/repositories/clinic-appointment-settings.repository.interface';

@Injectable()
export class ClinicAppointmentSettingsCommandRepository
  extends BaseCommandRepository<ClinicAppointmentSettings>
  implements IClinicAppointmentSettingsCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ClinicAppointmentSettings | null> {
    const raw = await this.db.clinicAppointmentSettings.findUnique({
      where: { id },
    });
    return raw ? new ClinicAppointmentSettings(raw) : null;
  }

  async create(
    entity: ClinicAppointmentSettings
  ): Promise<ClinicAppointmentSettings> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicAppointmentSettings.create({ data });
    return new ClinicAppointmentSettings(raw);
  }

  async save(
    entity: ClinicAppointmentSettings
  ): Promise<ClinicAppointmentSettings> {
    const data = entity.toPersistence();
    // 1:1 satellite → upsert anahtarı clinicId (unique). id PK olduğu için
    // update payload'ından çıkarılır (PK güncellenmez).
    const { id: _id, ...update } = data;
    const raw = await this.db.clinicAppointmentSettings.upsert({
      where: { clinicId: data.clinicId },
      create: data,
      update,
    });
    return new ClinicAppointmentSettings(raw);
  }
}
