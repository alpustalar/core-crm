import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  IAccountingPeriodCommandRepository,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { AccountingPeriod } from '@modules/finance/accounting/periods/domain/entities/accounting-period.entity';
import { OpenPeriodCommand } from './open-period.command';

/**
 * Bir organization için ilgili yılın muhasebe dönemini açar.
 * Aynı yıl için ikinci dönem açılamaz (organizationId+year unique).
 */
@CommandHandler(OpenPeriodCommand)
export class OpenPeriodHandler
  implements ICommandHandler<OpenPeriodCommand, string>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_COMMAND_REPOSITORY)
    private readonly periodCommandRepo: IAccountingPeriodCommandRepository,
    @Inject(ACCOUNTING_PERIOD_QUERY_REPOSITORY)
    private readonly periodQueryRepo: IAccountingPeriodQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: OpenPeriodCommand): Promise<string> {
    const { organizationId, year } = command;

    const existing = await this.periodQueryRepo.findByYear(
      organizationId,
      year
    );
    if (existing) {
      throw new ConflictException(
        `${year} yılı için muhasebe dönemi zaten mevcut.`
      );
    }

    const period = AccountingPeriod.create({ organizationId, year });

    await this.txManager.run(async () => {
      await this.periodCommandRepo.save(period);
    });

    return period.id;
  }
}
