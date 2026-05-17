import { UpdateClinicHandler } from './update-clinic/update-clinic.handler';
import { SoftDeleteManyClinicsByOrganizationIdHandler } from './soft-delete-many-clinics-by-organization-id/soft-delete-many-clinics-by-organization-id.handler';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateClinicHandler } from './create-clinic/create-clinic.handler';
import { ClinicEventModule } from '@modules/clinic/infrastructure/events/clinic-event.module';
import { PolicyModule } from '@modules/policy/policy.module';
import { CLINIC_REPO_TOKEN } from '@modules/clinic/domain/repositories/clinic.repository.interface';
import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';

const CommandHandlers = [
  UpdateClinicHandler,
  SoftDeleteManyClinicsByOrganizationIdHandler,
  CreateClinicHandler,
];

@Module({
  imports: [CqrsModule, ClinicEventModule, PolicyModule],
  providers: [
    ...CommandHandlers,
    {
      provide: CLINIC_REPO_TOKEN,
      useClass: ClinicRepository,
    },
  ],
  exports: [...CommandHandlers],
})
export class ClinicCommandModule {}
