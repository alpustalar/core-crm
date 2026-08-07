import { Module } from '@nestjs/common';
import { AccountingPeriodCommandModule } from '@modules/finance/accounting/periods/application/commands/command.module';
import { AccountingPeriodQueryModule } from '@modules/finance/accounting/periods/application/queries/query.module';

const ApplicationModules = [
  AccountingPeriodCommandModule,
  AccountingPeriodQueryModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class AccountingPeriodApplicationModule {}
