import { Module } from '@nestjs/common';
import { UpsertClinicGovernmentSpecsHandler } from './upsert-clinic-government-specs/upsert-clinic-government-specs.handler';
import { ClinicGovernanceInfrastructureModule } from '@modules/organization/clinic-governance/infrastructure/infrastructure.module';

const CommandHandlers = [UpsertClinicGovernmentSpecsHandler];

@Module({
  imports: [ClinicGovernanceInfrastructureModule],
  providers: [...CommandHandlers],
})
export class ClinicGovernmentSpecsCommandModule {}
