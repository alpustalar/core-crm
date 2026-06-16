import { UpdateClinicHandler } from './update-clinic/update-clinic.handler';
import { SoftDeleteManyClinicsByOrganizationIdHandler } from './soft-delete-many-clinics-by-organization-id/soft-delete-many-clinics-by-organization-id.handler';
import { Module } from '@nestjs/common';
import { CreateClinicHandler } from './create-clinic/create-clinic.handler';
import { SoftDeleteClinicHandler } from './soft-delete-clinic/soft-delete-clinic.handler';
import { ClinicEventModule } from '@modules/organization/clinic/infrastructure/events/clinic-event.module';
import { PolicyModule } from '@modules/platform/policy/policy.module';
import { ClinicRepositoryModule } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic/clinic.repository.module';

const CommandHandlers = [
  UpdateClinicHandler,
  SoftDeleteManyClinicsByOrganizationIdHandler,
  CreateClinicHandler,
  SoftDeleteClinicHandler,
];

@Module({
  imports: [ClinicEventModule, PolicyModule, ClinicRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ClinicCommandModule {}
