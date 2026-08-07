import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ReopenPeriodCommand } from './reopen-period.command';
import { PeriodNotFoundException } from '@modules/finance/accounting/periods/domain/exceptions/period.exceptions';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  IAccountingPeriodCommandRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period/accounting-period.command.repository';

@CommandHandler(ReopenPeriodCommand)
export class ReopenPeriodHandler
  implements ICommandHandler<ReopenPeriodCommand, void>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_COMMAND_REPOSITORY)
    private readonly accountingPeriodRepo: IAccountingPeriodCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReopenPeriodCommand): Promise<void> {
    const period = await this.accountingPeriodRepo.findById(command.periodId);
    if (!period) throw new PeriodNotFoundException();

    period.reopen();
    await this.txManager.run(async () => {
      await this.accountingPeriodRepo.update(period);
    });
  }
}
