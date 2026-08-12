import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConnectMetaAccountCommand } from './connect-meta-account.command';
import { ConnectMetaAccountResponse } from './connect-meta-account.response';
import {
  IMetaAdAccountCommandRepository,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { META_ADS_EVENTS } from '@src/domain/constants/events';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { MetaAdAccount } from '@modules/crm/meta-ads/domain/entities/meta-ad-account.entity';

@CommandHandler(ConnectMetaAccountCommand)
export class ConnectMetaAccountHandler implements ICommandHandler<
  ConnectMetaAccountCommand,
  ConnectMetaAccountResponse
> {
  constructor(
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly metaAdAccountRepo: IMetaAdAccountCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly tokenCipher: TokenCipherService,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: ConnectMetaAccountCommand
  ): Promise<ConnectMetaAccountResponse> {
    const { payload } = command;
    const { data, ctx, clinicId } = payload;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.actorCanManageTargetClinic(clinicId),
        'Bu klinik için Meta hesabı bağlama yetkiniz yok.'
      )
      .orThrow(META_ADS_EVENTS.ACCOUNT_CONNECTED);

    const metaAdAccount =
      await this.metaAdAccountRepo.findByClinicAndAdAccountId(
        clinicId,
        data.adAccountId
      );

    if (metaAdAccount) {
      throw new ConflictException('Bu klinik için bu Meta hesabı zaten bağlı.');
    }

    const encryptedToken = this.tokenCipher.encrypt(data.accessToken);

    const account = MetaAdAccount.create({
      clinicId,
      adAccountId: data.adAccountId,
      accessToken: encryptedToken,
      pageId: data.pageId,
      businessName: data.businessName,
      actorId: ctx.actor.userId,
      logSource: ctx.actor.source,
    });

    // Bağlantı event'i entity içinde raise edilir; yayınlanması için transaction şart.
    const savedAccount = await this.txManager.run(() =>
      this.metaAdAccountRepo.create(account)
    );

    return {
      id: savedAccount.id.value,
      adAccountId: account.adAccountId,
      businessName: account.businessName?.value ?? null,
    };
  }
}
