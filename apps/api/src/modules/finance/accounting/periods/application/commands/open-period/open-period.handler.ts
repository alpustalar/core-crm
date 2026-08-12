import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { AccountingPeriod } from '@modules/finance/accounting/periods/domain/entities/accounting-period.entity';
import { OpenPeriodCommand } from './open-period.command';
import { PeriodAlreadyExistsException } from '@modules/finance/accounting/periods/domain/exceptions/period.exceptions';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import {
  ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
  IAccountingPeriodCommandRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period/accounting-period.command.repository';

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
    private readonly accountingPeriodRepo: IAccountingPeriodCommandRepository,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: OpenPeriodCommand): Promise<string> {
    const { clinicId, year, ctx } = command.payload;

    const organizationId = await this.tenantScopeResolver.resolve({
      clinicId,
    });

    const period = AccountingPeriod.create({ clinicId, organizationId, year });

    await this.txManager.run(async () => {
      // "Zaten var mı" kararı yazmayla aynı transaction içinde ve command repo'dan;
      // nihai güvence `clinicId_year` unique kısıtı.
      const existing = await this.accountingPeriodRepo.findByYear(
        clinicId,
        year
      );
      if (existing) throw new PeriodAlreadyExistsException(year);

      await this.accountingPeriodRepo.create(period);
    });

    return period.id.value;
  }
}
