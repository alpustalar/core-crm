import { Module } from '@nestjs/common';
import {
  CLINIC_FINANCE_SETTINGS_COMMAND_REPOSITORY,
  CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY,
} from '@modules/organization/clinic/domain/repositories/clinic-finance-settings.repository.interface';
import { ClinicFinanceSettingsCommandRepository } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-finance-settings/clinic-finance-settings.command.repository';
import { ClinicFinanceSettingsQueryRepository } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-finance-settings/clinic-finance-settings.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_FINANCE_SETTINGS_COMMAND_REPOSITORY,
      useClass: ClinicFinanceSettingsCommandRepository,
    },
    {
      provide: CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY,
      useClass: ClinicFinanceSettingsQueryRepository,
    },
  ],
  exports: [
    CLINIC_FINANCE_SETTINGS_COMMAND_REPOSITORY,
    CLINIC_FINANCE_SETTINGS_QUERY_REPOSITORY,
  ],
})
export class ClinicFinanceSettingsRepositoryModule {}
