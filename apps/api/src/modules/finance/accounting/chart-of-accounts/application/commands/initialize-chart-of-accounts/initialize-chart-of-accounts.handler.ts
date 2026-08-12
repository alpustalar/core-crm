import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';
import { InitializeChartOfAccountsCommand } from './initialize-chart-of-accounts.command';
import {
  ACCOUNT_COMMAND_REPOSITORY,
  IAccountCommandRepository,
} from '@modules/finance/accounting/chart-of-accounts/domain/repositories/account/account.command.repository';
import { TENANT_SCOPE_RESOLVER } from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ITenantScopeResolver } from '@shared';

/**
 * Bir clinic (şube/defter) için klinik TDHP hesap planını kurar.
 * İdempotent için: hesap planı zaten varsa hiçbir şey yapmaz
 */

@CommandHandler(InitializeChartOfAccountsCommand)
export class InitializeChartOfAccountsHandler
  implements ICommandHandler<InitializeChartOfAccountsCommand, void>
{
  constructor(
    @Inject(ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountRepo: IAccountCommandRepository,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: InitializeChartOfAccountsCommand): Promise<void> {
    const { clinicId, ctx } = command.payload;

    const organizationId = await this.tenantScopeResolver.resolve(
      command.payload
    );
    await this.txManager.run(async () => {
      const alreadyInitialized =
        await this.accountRepo.existsForClinic(clinicId);
      if (alreadyInitialized) return;

      const accounts = Account.buildChartFromTemplate({
        clinicId,
        organizationId,
      });

      await this.accountRepo.createChart(accounts);
    });
  }
}
