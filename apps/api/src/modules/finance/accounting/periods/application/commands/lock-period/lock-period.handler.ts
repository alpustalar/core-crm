import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  IAccountingPeriodCommandRepository,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { LockPeriodCommand } from './lock-period.command';

@CommandHandler(LockPeriodCommand)
export class LockPeriodHandler
  implements ICommandHandler<LockPeriodCommand, void>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_COMMAND_REPOSITORY)
    private readonly periodCommandRepo: IAccountingPeriodCommandRepository,
    @Inject(ACCOUNTING_PERIOD_QUERY_REPOSITORY)
    private readonly periodQueryRepo: IAccountingPeriodQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: LockPeriodCommand): Promise<void> {
    const period = await this.periodQueryRepo.findById(command.periodId);
    if (!period) {
      throw new NotFoundException(`Dönem bulunamadı: ${command.periodId}`);
    }

    period.lock();
    await this.txManager.run(async () => {
      await this.periodCommandRepo.save(period);
    });
  }
}
