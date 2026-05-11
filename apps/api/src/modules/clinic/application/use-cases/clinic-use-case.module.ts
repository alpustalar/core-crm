import {
  CreateClinicUseCase,
  SoftDeleteClinicByIdUseCase,
  SoftDeleteClinicsByOrganizationIdUseCase,
  UpdateClinicUseCase,
} from '@modules/clinic/application/use-cases/commands';
import {
  FindClinicAvailabilityByDayUseCase,
  FindManyByOrganizationIdUseCase,
  GetClinicScheduleUseCase,
} from '@modules/clinic/application/use-cases/queries';
import { Module } from '@nestjs/common';
import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';
import { ClinicAvailabilityRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic-availability.repository';
import { ClinicEventPublisher } from '@modules/clinic/infrastructure/events/publisher/clinic.event-publisher';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { ContextService } from '@src/infrastructure/persistence/prisma/context/context.service';
import { CLINIC_AVAILABILITY_REPO_TOKEN } from '@modules/clinic/domain/repositories/clinic-availability.repository.interface';
import { CLINIC_REPO_TOKEN } from '@modules/clinic/domain/repositories/clinic.repository.interface';

const UseCases = [
  CreateClinicUseCase,
  UpdateClinicUseCase,
  SoftDeleteClinicByIdUseCase,
  SoftDeleteClinicsByOrganizationIdUseCase,
  FindManyByOrganizationIdUseCase,
  FindClinicAvailabilityByDayUseCase,
  GetClinicScheduleUseCase,
];

@Module({
  providers: [
    ...UseCases,
    {
      provide: CLINIC_REPO_TOKEN,
      useClass: ClinicRepository,
    },
    {
      provide: CLINIC_AVAILABILITY_REPO_TOKEN,
      useClass: ClinicAvailabilityRepository,
    },
    ClinicEventPublisher,
    PolicyFactory,
    ContextService,
  ],
  exports: [...UseCases],
})
export class ClinicUseCaseModule {}
