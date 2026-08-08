import { Module } from '@nestjs/common';
import { ClinicGovernmentSpecsRepositoryModule } from '@modules/organization/clinic-governance/infrastructure/persistence/prisma/repositories/clinic-government-specs/clinic-government-specs.repository.module';

const ClinicGovernanceRepositoriesModules = [
  ClinicGovernmentSpecsRepositoryModule,
];

@Module({
  imports: [...ClinicGovernanceRepositoriesModules],
  exports: [...ClinicGovernanceRepositoriesModules],
})
export class ClinicGovernanceRepositoriesModule {}
