import { Module } from '@nestjs/common';
import { GetClinicGovernmentSpecsHandler } from './get-clinic-government-specs/get-clinic-government-specs.handler';
import { ClinicGovernanceRepositoriesModule } from '@modules/organization/clinic-governance/infrastructure/persistence/prisma/repositories/repositories.module';

const QueryHandlers = [GetClinicGovernmentSpecsHandler];

@Module({
  imports: [ClinicGovernanceRepositoriesModule],
  providers: [...QueryHandlers],
})
export class ClinicGovernmentSpecsQueryModule {}
