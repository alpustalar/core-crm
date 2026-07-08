import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ClinicAppointmentSettings } from '@modules/organization/clinic/domain/entities/clinic-appointment-settings.entity';
import { IClinicAppointmentSettingsQueryRepository } from '@modules/organization/clinic/domain/repositories/clinic-appointment-settings.repository.interface';

@Injectable()
export class ClinicAppointmentSettingsQueryRepository
  extends BaseRepository
  implements IClinicAppointmentSettingsQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicAppointmentSettings | null> {
    const raw = await this.db.clinicAppointmentSettings.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicAppointmentSettings(raw) : null;
  }
}
