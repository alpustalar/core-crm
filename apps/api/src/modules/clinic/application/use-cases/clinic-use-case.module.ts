import { ClinicRepository } from '@modules/clinic/infrastructure/persistence/prisma/repositories/clinic.repository';

import { Module } from '@nestjs/common';
import { ClinicEventPublisher } from '../../../infrastructure/events/publisher';
import {
  CreateClinicUseCase,
  FindManyByOrganizationIdUseCase,
  SoftDeleteClinicsByOrganizationIdUseCase,
  SoftDeleteClinicUseCase,
  UpdateClinicUseCase,
} from '@modules/clinic/application/use-cases';
import { PolicyFactory } from '@modules/policy/policy-factory';
import { ContextService } from '@src/infrastructure/persistence/prisma/context.service';

const UseCases = [
  CreateClinicUseCase,
  UpdateClinicUseCase,
  SoftDeleteClinicUseCase,
  SoftDeleteClinicsByOrganizationIdUseCase,
  FindManyByOrganizationIdUseCase,
];

@Module({
  providers: [
    ...UseCases,
    ClinicRepository,
    ClinicEventPublisher,
    PolicyFactory,
    ContextService,
  ],
  exports: [...UseCases],
})
export class ClinicUseCaseModule {}
