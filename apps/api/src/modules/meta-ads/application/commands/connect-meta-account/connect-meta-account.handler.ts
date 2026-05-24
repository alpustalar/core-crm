import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { ConnectMetaAccountCommand } from './connect-meta-account.command';
import { ConnectMetaAccountResponse } from './connect-meta-account.response';
import {
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
  IMetaAdAccountCommandRepository,
  IMetaAdAccountQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import {
  META_ADS_EVENT_PUBLISHER,
  IMetaAdsEventPublisher,
} from '@modules/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import { TokenCipherService } from '@modules/meta-ads/infrastructure/crypto/token-cipher.service';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';
import { ConflictException } from '@nestjs/common';

@CommandHandler(ConnectMetaAccountCommand)
export class ConnectMetaAccountHandler
  implements ICommandHandler<ConnectMetaAccountCommand, ConnectMetaAccountResponse>
{
  constructor(
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IMetaAdAccountCommandRepository,
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IMetaAdAccountQueryRepository,
    @Inject(META_ADS_EVENT_PUBLISHER)
    private readonly eventPublisher: IMetaAdsEventPublisher,
    private readonly tokenCipher: TokenCipherService,
  ) {}

  async execute(
    command: ConnectMetaAccountCommand,
  ): Promise<ConnectMetaAccountResponse> {
    const { dto, clinicId, ctx } = command;
    const { actor, source } = ctx;

    const existing = await this.accountQueryRepo.findByClinicAndAdAccountId(
      clinicId,
      dto.adAccountId,
    );

    if (existing) {
      throw new ConflictException(
        'Bu klinik için bu Meta hesabı zaten bağlı.',
      );
    }

    const encryptedToken = this.tokenCipher.encrypt(dto.accessToken);

    const account = await this.accountCommandRepo.create({
      id: randomUUID(),
      clinicId,
      adAccountId: dto.adAccountId,
      accessToken: encryptedToken,
      pageId: dto.pageId,
      businessName: dto.businessName,
    });

    this.eventPublisher.accountConnected({
      metaAdAccountId: account.id,
      clinicId,
      adAccountId: dto.adAccountId,
      actorId: actor.userId,
      source: LogSource.WEB,
      action: LogAction.META_ADS_ACCOUNT_CONNECTED,
      type: LogType.INFO,
      details: `Meta hesap bağlandı: ${dto.adAccountId}`,
    });

    return {
      id: account.id,
      adAccountId: account.adAccountId,
      businessName: account.businessName,
    };
  }
}
