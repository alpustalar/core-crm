import { ClinicGovernanceRepositoriesModule } from '@modules/organization/clinic-governance/infrastructure/persistence/prisma/repositories/repositories.module';
import { Module } from '@nestjs/common';

const InfrastructureModules = [ClinicGovernanceRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ClinicGovernanceInfrastructureModule {}
