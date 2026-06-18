import { Module } from '@nestjs/common';
import { ClinicGovernmentSpecsCommandModule } from './application/commands/command.module';
import { ClinicGovernmentSpecsQueryModule } from './application/queries/query.module';
import { GovernancePresentationModule } from './presentation/governance-presentation.module';

@Module({
  imports: [
    ClinicGovernmentSpecsCommandModule,
    ClinicGovernmentSpecsQueryModule,
    GovernancePresentationModule,
  ],
  exports: [
    ClinicGovernmentSpecsCommandModule,
    ClinicGovernmentSpecsQueryModule,
  ],
})
export class GovernanceModule {}
