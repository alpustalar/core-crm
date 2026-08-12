import { Module } from '@nestjs/common';
import { OpenPeriodHandler } from './open-period/open-period.handler';
import { LockPeriodHandler } from './lock-period/lock-period.handler';
import { ReopenPeriodHandler } from './reopen-period/reopen-period.handler';
import { ClosePeriodHandler } from './close-period/close-period.handler';
import { AccountingPeriodRepositoryModule } from '@modules/finance/accounting/periods/infrastructure/persistence/prisma/repositories/accounting-period/accounting-period.repository.module';

const CommandHandlers = [
  OpenPeriodHandler,
  LockPeriodHandler,
  ReopenPeriodHandler,
  ClosePeriodHandler,
];

@Module({
  imports: [AccountingPeriodRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class AccountingPeriodCommandModule {}
