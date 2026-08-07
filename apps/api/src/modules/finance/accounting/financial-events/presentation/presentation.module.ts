import { Module } from '@nestjs/common';
import { FinancialEventController } from './controllers/financial-event.controller';
import { FinancialEventApplicationModule } from '@modules/finance/accounting/financial-events/application/application.module';

@Module({
  imports: [FinancialEventApplicationModule],
  controllers: [FinancialEventController],
})
export class FinancialEventPresentationModule {}
