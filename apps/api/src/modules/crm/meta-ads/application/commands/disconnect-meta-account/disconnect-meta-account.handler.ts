import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DisconnectMetaAccountCommand } from './disconnect-meta-account.command';
import {
  IMetaAdAccountCommandRepository,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { META_ADS_EVENTS } from '@src/domain/constants/events';
import { MetaAdsNotFoundException } from '@modules/crm/meta-ads/domain/exceptions/meta-ads.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(DisconnectMetaAccountCommand)
export class DisconnectMetaAccountHandler
  implements ICommandHandler<DisconnectMetaAccountCommand, void>
{
  constructor(
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly metaAdAccountRepo: IMetaAdAccountCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: DisconnectMetaAccountCommand): Promise<void> {
    const { clinicId, accountId, ctx } = command.payload;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.actorCanManageTargetClinic(clinicId),
        'Bu klinik için Meta hesabı bağlantısını kesme yetkiniz yok.'
      )
      .orThrow(META_ADS_EVENTS.ACCOUNT_DISCONNECTED);

    await this.txManager.run(async () => {
      const account = await this.metaAdAccountRepo.findById(accountId);

      if (!account || account.clinicId.value !== clinicId) {
        throw new MetaAdsNotFoundException();
      }

      account.deactivate({
        actorId: ctx.actor.userId,
        logSource: ctx.actor.source,
      });

      await this.metaAdAccountRepo.update(account);
    });
  }
}
