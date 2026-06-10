import { Module } from '@nestjs/common';
import { GetAccountingPeriodsHandler } from './get-accounting-periods/get-accounting-periods.handler';
import { FindPeriodByDateHandler } from './find-period-by-date/find-period-by-date.handler';
import { AccountingPeriodRepositoryModule } from '@modules/finance/accounting/periods/infrastructure/persistence/prisma/repositories/accounting-period/accounting-period.repository.module';

const QueryHandlers = [GetAccountingPeriodsHandler, FindPeriodByDateHandler];

@Module({
  imports: [AccountingPeriodRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class AccountingPeriodQueryModule {}
