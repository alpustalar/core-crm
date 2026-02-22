import { ClinicRepository } from '../../repositories/clinic.repository';

import { Module } from '@nestjs/common';
import { ClinicEventPublisher } from '../../events/publisher';
import {
  CreateClinicUseCase,
  FindManyByOrganizationIdUseCase,
  SoftDeleteClinicsByOrganizationIdUseCase,
  SoftDeleteClinicUseCase,
  UpdateClinicUseCase,
} from '@clinic-use-cases';
import { PolicyFactory } from '@common/policy/factory.policy';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { SoftDeleteManyUserForCascadeUseCase } from '@user-use-cases';
import { UserUseCaseModule } from '@modules/user/use-cases/module';

const UseCases = [
  CreateClinicUseCase,
  UpdateClinicUseCase,
  SoftDeleteClinicUseCase,
  SoftDeleteClinicsByOrganizationIdUseCase,
  FindManyByOrganizationIdUseCase,
  SoftDeleteManyUserForCascadeUseCase,
];

@Module({
  imports: [PrismaModule, UserUseCaseModule],
  providers: [
    ...UseCases,
    ClinicRepository,
    ClinicEventPublisher,
    PolicyFactory,
  ],
  exports: [...UseCases],
})
export class ClinicUseCaseModule {}
