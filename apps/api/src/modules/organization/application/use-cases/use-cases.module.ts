import {
  CreateOrganizationUseCase,
  SoftDeleteOrganizationUseCase,
  UpdateOrganizationUseCase,
} from './commands';
import { FindOneUseCase } from './queries/find-one.use-case';
import { Module } from '@nestjs/common';
import { OrganizationRepository } from '@modules/organization/infrastructure/persistence/prisma/repositories/organization.repository';

const UseCases = [
  CreateOrganizationUseCase,
  UpdateOrganizationUseCase,
  SoftDeleteOrganizationUseCase,
  FindOneUseCase,
];

@Module({
  providers: [...UseCases, OrganizationRepository],
  exports: [...UseCases],
})
export class OrganizationUseCasesModule {}
