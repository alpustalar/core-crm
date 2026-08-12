import { Module } from '@nestjs/common';
import { GovernanceQueryController } from './controllers/governance.query.controller';
import { GovernanceCommandController } from './controllers/governance.command.controller';
import { ClinicGovernmentSpecsCommandModule } from '@modules/organization/clinic-governance/application/commands/command.module';
import { ClinicGovernmentSpecsQueryModule } from '@modules/organization/clinic-governance/application/queries/query.module';

@Module({
  imports: [
    ClinicGovernmentSpecsCommandModule,
    ClinicGovernmentSpecsQueryModule,
  ],
  controllers: [GovernanceQueryController, GovernanceCommandController],
})
export class GovernancePresentationModule {}
