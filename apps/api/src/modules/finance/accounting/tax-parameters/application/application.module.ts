import { Module } from '@nestjs/common';
import { TaxParameterCommandModule } from '@modules/finance/accounting/tax-parameters/application/commands/command.module';
import { TaxParameterQueryModule } from '@modules/finance/accounting/tax-parameters/application/queries/query.module';

const ApplicationModules = [TaxParameterCommandModule, TaxParameterQueryModule];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class TaxParameterApplicationModule {}
