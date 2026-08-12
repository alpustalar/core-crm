import { Module } from '@nestjs/common';
import { GetFinancialEventsHandler } from './get-financial-events/get-financial-events.handler';
import { GetFinancialEventByIdHandler } from './get-financial-event-by-id/get-financial-event-by-id.handler';
import { FinancialEventRepositoriesModule } from '@modules/finance/accounting/financial-events/infrastructure/persistence/prisma/repositories/repositories.module';
import { ClinicDomainServicesModule } from '@modules/organization/clinic/domain/services/services.module';

const QueryHandlers = [GetFinancialEventsHandler, GetFinancialEventByIdHandler];

@Module({
  imports: [FinancialEventRepositoriesModule, ClinicDomainServicesModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class FinancialEventQueryModule {}
