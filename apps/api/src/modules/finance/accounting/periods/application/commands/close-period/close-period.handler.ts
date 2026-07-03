import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { GenerateYearEndClosingCommand } from '@modules/finance/accounting/posting/application/commands/generate-year-end-closing/generate-year-end-closing.command';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  IAccountingPeriodCommandRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { ClosePeriodCommand } from './close-period.command';
import { PeriodNotFoundException } from '@modules/finance/accounting/periods/domain/exceptions/period.exceptions';

@CommandHandler(ClosePeriodCommand)
export class ClosePeriodHandler
  implements ICommandHandler<ClosePeriodCommand, void>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_COMMAND_REPOSITORY)
    private readonly periodCommandRepo: IAccountingPeriodCommandRepository,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ClosePeriodCommand): Promise<void> {
    const period = await this.periodCommandRepo.findById(command.periodId);
    if (!period) throw new PeriodNotFoundException();

    period.validate.isOpenOrLocked.orThrow();

    // Kapanış fişleri (dönem hâlâ postable) + dönem CLOSED, transaction
    await this.txManager.outboxRun(async () => {
      await this.commandBus.execute(
        new GenerateYearEndClosingCommand(
          {
            clinicId: period.clinicId.value,
            organizationId: period.organizationId.value,
            periodId: period.id.value,
            dateFrom: period.startsAt,
            dateTo: period.endsAt,
            entryDate: period.endsAt,
            performedById: command.ctx.actor.userId,
          },
          command.ctx
        )
      );

      period.close();
      await this.periodCommandRepo.save(period);
    });
  }
}
