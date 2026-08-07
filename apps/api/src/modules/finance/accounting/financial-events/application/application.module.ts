import { Module } from '@nestjs/common';
import { FinancialEventCommandModule } from '@modules/finance/accounting/financial-events/application/commands/command.module';
import { FinancialEventQueryModule } from '@modules/finance/accounting/financial-events/application/queries/query.module';

const ApplicationModules = [
  FinancialEventCommandModule,
  FinancialEventQueryModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class FinancialEventApplicationModule {}
