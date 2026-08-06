import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicAppointmentSettingsQueryRepository } from '@modules/organization/clinic/domain/repositories/clinic-appointment-settings/clinic-appointment-settings.query.repository.interface';
import { ClinicAppointmentSettings } from '@shared';

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
    return this.db.clinicAppointmentSettings.findUnique({
      where: { clinicId },
    });
  }
}
