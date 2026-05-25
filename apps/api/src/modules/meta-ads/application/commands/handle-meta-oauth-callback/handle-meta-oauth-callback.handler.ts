import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { HandleMetaOAuthCallbackCommand } from './handle-meta-oauth-callback.command';
import { HandleMetaOAuthCallbackResponse } from './handle-meta-oauth-callback.response';
import {
  IMetaAdAccountCommandRepository,
  IMetaAdAccountQueryRepository,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import {
  IMetaAdsEventPublisher,
  META_ADS_EVENT_PUBLISHER,
} from '@modules/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import { MetaMarketingApiService } from '@modules/meta-ads/infrastructure/http/meta-marketing-api.service';
import { TokenCipherService } from '@modules/meta-ads/infrastructure/crypto/token-cipher.service';
import { RedisService } from '@common/redis/redis.service';
import { ENV } from '@common/constants/env.constant';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';

interface OAuthStatePayload {
  clinicId: string;
  userId: string;
}

@CommandHandler(HandleMetaOAuthCallbackCommand)
export class HandleMetaOAuthCallbackHandler
  implements
    ICommandHandler<
      HandleMetaOAuthCallbackCommand,
      HandleMetaOAuthCallbackResponse
    >
{
  private readonly logger = new Logger(HandleMetaOAuthCallbackHandler.name);

  constructor(
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IMetaAdAccountCommandRepository,
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IMetaAdAccountQueryRepository,
    @Inject(META_ADS_EVENT_PUBLISHER)
    private readonly eventPublisher: IMetaAdsEventPublisher,
    private readonly metaApi: MetaMarketingApiService,
    private readonly tokenCipher: TokenCipherService,
    private readonly redis: RedisService,
    private readonly config: ConfigService
  ) {}

  async execute(
    command: HandleMetaOAuthCallbackCommand
  ): Promise<HandleMetaOAuthCallbackResponse> {
    const { code, state } = command;

    const raw = await this.redis.getMetaOAuthState(state);
    if (!raw)
      throw new UnauthorizedException(
        'Geçersiz veya süresi dolmuş OAuth state.'
      );

    await this.redis.deleteMetaOAuthState(state);

    const { clinicId, userId } = JSON.parse(raw) as OAuthStatePayload;

    const appId = this.config.getOrThrow<string>(ENV.META_APP_ID);
    const appSecret = this.config.getOrThrow<string>(ENV.META_APP_SECRET);
    const redirectUri = this.config.getOrThrow<string>(
      ENV.META_OAUTH_REDIRECT_URI
    );

    const shortLivedToken = await this.metaApi.exchangeCodeForToken(
      code,
      appId,
      appSecret,
      redirectUri
    );
    const longLivedToken = await this.metaApi.extendToLongLivedToken(
      shortLivedToken,
      appId,
      appSecret
    );

    const [adAccounts, pages] = await Promise.all([
      this.metaApi.getAdAccounts(longLivedToken),
      this.metaApi.getPages(longLivedToken),
    ]);

    const encryptedToken = this.tokenCipher.encrypt(longLivedToken);
    const firstPage = pages[0];

    let connectedAccounts = 0;

    for (const adAccount of adAccounts) {
      const existing = await this.accountQueryRepo.findByClinicAndAdAccountId(
        clinicId,
        adAccount.id
      );
      if (existing) continue;

      const account = await this.accountCommandRepo.create({
        id: randomUUID(),
        clinicId,
        adAccountId: adAccount.id,
        accessToken: encryptedToken,
        pageId: firstPage?.id ?? null,
        businessName: adAccount.name ?? null,
      });

      this.eventPublisher.accountConnected({
        metaAdAccountId: account.id,
        clinicId,
        adAccountId: adAccount.id,
        actorId: userId,
        source: LogSource.WEB,
        action: LogAction.META_ADS_ACCOUNT_CONNECTED,
        type: LogType.INFO,
        details: `Meta hesap OAuth ile bağlandı: ${adAccount.id}`,
      });

      connectedAccounts++;
    }

    this.logger.log(
      `OAuth callback: ${connectedAccounts} hesap bağlandı (clinic: ${clinicId})`
    );

    return { connectedAccounts };
  }
}
