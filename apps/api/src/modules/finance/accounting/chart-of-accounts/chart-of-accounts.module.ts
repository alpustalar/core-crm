import { Module } from '@nestjs/common';
import { ChartOfAccountsCommandModule } from './application/commands/command.module';
import { ChartOfAccountsQueryModule } from './application/queries/query.module';
import { ChartOfAccountsPresentationModule } from './presentation/chart-of-accounts-presentation.module';

@Module({
  imports: [
    ChartOfAccountsCommandModule,
    ChartOfAccountsQueryModule,
    ChartOfAccountsPresentationModule,
  ],
  exports: [ChartOfAccountsCommandModule, ChartOfAccountsQueryModule],
})
export class ChartOfAccountsModule {}
