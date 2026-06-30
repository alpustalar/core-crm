import { Module } from '@nestjs/common';
import { ClinicRepositoryModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic/clinic.repository.module';
import { ClinicAvailabilityRepositoryModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-availability/clinic-availability.repository.module';
import { ClinicExceptionRepositoryModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-exception/clinic-exception.repository.module';
import { ClinicFinanceSettingsRepositoryModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-finance-settings/clinic-finance-settings.repository.module';

const Modules = [
  ClinicRepositoryModule,
  ClinicAvailabilityRepositoryModule,
  ClinicExceptionRepositoryModule,
  ClinicFinanceSettingsRepositoryModule,
];
@Module({
  imports: Modules,
  exports: Modules,
})
export class ClinicRepositoriesModule {}
