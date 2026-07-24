import { UpdateClinicHandler } from './update-clinic/update-clinic.handler';
import { SoftDeleteManyClinicsByOrganizationIdHandler } from './soft-delete-many-clinics-by-organization-id/soft-delete-many-clinics-by-organization-id.handler';
import { Module } from '@nestjs/common';
import { CreateClinicHandler } from './create-clinic/create-clinic.handler';
import { SoftDeleteClinicHandler } from './soft-delete-clinic/soft-delete-clinic.handler';
import { UpdateClinicAppointmentSettingsHandler } from './update-clinic-appointment-settings/update-clinic-appointment-settings.handler';
import { ClinicEventModule } from '@modules/organization/clinic/infrastructure/events/clinic-event.module';
import { ClinicRepositoriesModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/repositories.module';
import { ClinicCacheService } from '@modules/organization/clinic/infrastructure/cache/clinic-cache.service';

const CommandHandlers = [
  UpdateClinicHandler,
  SoftDeleteManyClinicsByOrganizationIdHandler,
  CreateClinicHandler,
  SoftDeleteClinicHandler,
  UpdateClinicAppointmentSettingsHandler,
];

@Module({
  imports: [ClinicEventModule, ClinicRepositoriesModule],
  providers: [...CommandHandlers, ClinicCacheService],
  exports: [...CommandHandlers],
})
export class ClinicCommandModule {}
