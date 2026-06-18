import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { GenerateYearEndClosingCommand } from '@modules/finance/accounting/posting/application/commands/generate-year-end-closing/generate-year-end-closing.command';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  IAccountingPeriodCommandRepository,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { ClosePeriodCommand } from './close-period.command';

@CommandHandler(ClosePeriodCommand)
export class ClosePeriodHandler
  implements ICommandHandler<ClosePeriodCommand, void>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_COMMAND_REPOSITORY)
    private readonly periodCommandRepo: IAccountingPeriodCommandRepository,
    @Inject(ACCOUNTING_PERIOD_QUERY_REPOSITORY)
    private readonly periodQueryRepo: IAccountingPeriodQueryRepository,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ClosePeriodCommand): Promise<void> {
    const period = await this.periodQueryRepo.findById(command.periodId);
    if (!period) {
      throw new NotFoundException(`Dönem bulunamadı: ${command.periodId}`);
    }
    if (period.isClosed()) {
      throw new ConflictException(`Dönem ${period.year} zaten kapatılmış.`);
    }

    // Kapanış fişleri (dönem hâlâ postable) + dönem CLOSED atomik (kritik finansal).
    await this.txManager.outboxRun(async () => {
      await this.commandBus.execute(
        new GenerateYearEndClosingCommand(
          {
            clinicId: period.clinicId,
            organizationId: period.organizationId,
            periodId: period.id,
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
