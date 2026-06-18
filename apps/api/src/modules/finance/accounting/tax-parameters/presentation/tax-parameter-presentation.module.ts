import { Module } from '@nestjs/common';
import { TaxParameterController } from './controllers/tax-parameter.controller';
import { TaxParameterCommandModule } from '@modules/finance/accounting/tax-parameters/application/commands/command.module';
import { TaxParameterQueryModule } from '@modules/finance/accounting/tax-parameters/application/queries/query.module';

@Module({
  imports: [TaxParameterCommandModule, TaxParameterQueryModule],
  controllers: [TaxParameterController],
})
export class TaxParameterPresentationModule {}
