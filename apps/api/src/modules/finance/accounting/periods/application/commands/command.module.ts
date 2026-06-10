import { Module } from '@nestjs/common';
import { OpenPeriodHandler } from './open-period/open-period.handler';
import { AccountingPeriodRepositoryModule } from '@modules/finance/accounting/periods/infrastructure/persistence/prisma/repositories/accounting-period/accounting-period.repository.module';

const CommandHandlers = [OpenPeriodHandler];

@Module({
  imports: [AccountingPeriodRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class AccountingPeriodCommandModule {}
