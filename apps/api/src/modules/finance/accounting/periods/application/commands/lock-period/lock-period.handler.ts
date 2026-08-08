import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { LockPeriodCommand } from './lock-period.command';
import { PeriodNotFoundException } from '@modules/finance/accounting/periods/domain/exceptions/period.exceptions';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  IAccountingPeriodCommandRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period/accounting-period.command.repository';

@CommandHandler(LockPeriodCommand)
export class LockPeriodHandler
  implements ICommandHandler<LockPeriodCommand, void>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_COMMAND_REPOSITORY)
    private readonly accountingPeriodRepo: IAccountingPeriodCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: LockPeriodCommand): Promise<void> {
    const period = await this.accountingPeriodRepo.findById(command.periodId);
    if (!period) throw new PeriodNotFoundException();

    period.lock();
    await this.txManager.run(async () => {
      await this.accountingPeriodRepo.update(period);
    });
  }
}
