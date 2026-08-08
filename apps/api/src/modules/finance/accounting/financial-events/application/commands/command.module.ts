import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RecordFinancialEventHandler } from './record-financial-event/record-financial-event.handler';
import { RecordSupplierPaymentHandler } from './record-supplier-payment/record-supplier-payment.handler';
import { FinancialEventRepositoriesModule } from '@modules/finance/accounting/financial-events/infrastructure/persistence/prisma/repositories/repositories.module';

const CommandHandlers = [
  RecordFinancialEventHandler,
  RecordSupplierPaymentHandler,
];

@Module({
  imports: [CqrsModule, FinancialEventRepositoriesModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class FinancialEventCommandModule {}
