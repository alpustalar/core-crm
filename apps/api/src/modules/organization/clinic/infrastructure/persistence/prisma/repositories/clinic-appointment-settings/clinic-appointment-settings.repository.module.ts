import { Module } from '@nestjs/common';

import { ClinicAppointmentSettingsCommandRepository } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-appointment-settings/clinic-appointment-settings.command.repository';
import { ClinicAppointmentSettingsQueryRepository } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-appointment-settings/clinic-appointment-settings.query.repository';
import { CLINIC_APPOINTMENT_SETTINGS_COMMAND_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic-appointment-settings/clinic-appointment-settings.command.repository.interface';
import { CLINIC_APPOINTMENT_SETTINGS_QUERY_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic-appointment-settings/clinic-appointment-settings.query.repository.interface';

@Module({
  providers: [
    {
      provide: CLINIC_APPOINTMENT_SETTINGS_COMMAND_REPOSITORY,
      useClass: ClinicAppointmentSettingsCommandRepository,
    },
    {
      provide: CLINIC_APPOINTMENT_SETTINGS_QUERY_REPOSITORY,
      useClass: ClinicAppointmentSettingsQueryRepository,
    },
  ],
  exports: [
    CLINIC_APPOINTMENT_SETTINGS_COMMAND_REPOSITORY,
    CLINIC_APPOINTMENT_SETTINGS_QUERY_REPOSITORY,
  ],
})
export class ClinicAppointmentSettingsRepositoryModule {}
