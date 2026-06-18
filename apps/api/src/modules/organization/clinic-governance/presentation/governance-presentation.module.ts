import { Module } from '@nestjs/common';
import { GovernanceController } from './controllers/governance.controller';
import { ClinicGovernmentSpecsCommandModule } from '@modules/organization/clinic-governance/application/commands/command.module';
import { ClinicGovernmentSpecsQueryModule } from '@modules/organization/clinic-governance/application/queries/query.module';

@Module({
  imports: [
    ClinicGovernmentSpecsCommandModule,
    ClinicGovernmentSpecsQueryModule,
  ],
  controllers: [GovernanceController],
})
export class GovernancePresentationModule {}
