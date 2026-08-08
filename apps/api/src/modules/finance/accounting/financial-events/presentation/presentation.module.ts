import { Module } from '@nestjs/common';
import { FinancialEventController } from '@modules/finance/accounting/financial-events/presentation/http/controllers/financial-event.controller';

@Module({ controllers: [FinancialEventController] })
export class FinancialEventPresentationModule {}
