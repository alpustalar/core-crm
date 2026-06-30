import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  IAccountingPeriodCommandRepository,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { AccountingPeriod } from '@modules/finance/accounting/periods/domain/entities/accounting-period.entity';
import { OpenPeriodCommand } from './open-period.command';
import { PeriodAlreadyExistsException } from '@modules/finance/accounting/periods/domain/exceptions/period.exceptions';

/**
 * Bir clinic (defter) için ilgili yılın muhasebe dönemini açar.
 * Aynı yıl için ikinci dönem açılamaz (clinicId+year unique).
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
    const { clinicId, organizationId, year } = command;

    const existing = await this.periodQueryRepo.findByYear(clinicId, year);
    if (existing) throw new PeriodAlreadyExistsException(year);

    const period = AccountingPeriod.create({ clinicId, organizationId, year });

    await this.txManager.run(async () => {
      await this.periodCommandRepo.save(period);
    });

    return period.id;
  }
}
