import { Module } from '@nestjs/common';
import { RecordFinancialEventHandler } from './record-financial-event/record-financial-event.handler';
import { FinancialEventRepositoryModule } from '@modules/finance/accounting/financial-events/infrastructure/persistence/prisma/repositories/financial-event/financial-event.repository.module';

const CommandHandlers = [RecordFinancialEventHandler];

@Module({
  imports: [FinancialEventRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class FinancialEventCommandModule {}
