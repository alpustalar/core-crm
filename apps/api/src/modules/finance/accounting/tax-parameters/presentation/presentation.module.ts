import { Module } from '@nestjs/common';
import { TaxParameterController } from '@modules/finance/accounting/tax-parameters/presentation/http/controllers/tax-parameter.controller';
import { TaxParameterApplicationModule } from '@modules/finance/accounting/tax-parameters/application/application.module';

@Module({
  imports: [TaxParameterApplicationModule],
  controllers: [TaxParameterController],
})
export class TaxParameterPresentationModule {}
