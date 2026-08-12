import { Module } from '@nestjs/common';
import { TaxParameterQueryController } from '@modules/finance/accounting/tax-parameters/presentation/http/controllers/tax-parameter.query.controller';
import { TaxParameterCommandController } from '@modules/finance/accounting/tax-parameters/presentation/http/controllers/tax-parameter.command.controller';
import { TaxParameterApplicationModule } from '@modules/finance/accounting/tax-parameters/application/application.module';

@Module({
  imports: [TaxParameterApplicationModule],
  controllers: [TaxParameterQueryController, TaxParameterCommandController],
})
export class TaxParameterPresentationModule {}
