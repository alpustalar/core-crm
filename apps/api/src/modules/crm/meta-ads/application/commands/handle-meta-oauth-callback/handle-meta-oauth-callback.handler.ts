import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { HandleMetaOAuthCallbackCommand } from './handle-meta-oauth-callback.command';
import { HandleMetaOAuthCallbackResponse } from './handle-meta-oauth-callback.response';
import {
  IMetaAdAccountCommandRepository,
  IMetaAdAccountQueryRepository,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import {
  IMetaAdsEventPublisher,
  META_ADS_EVENT_PUBLISHER,
} from '@modules/crm/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import {
  IMetaMarketingApiService,
  META_MARKETING_API_SERVICE,
} from '@modules/crm/meta-ads/domain/interfaces/meta-marketing-api.interface';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { ENV } from '@common/constants/env.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { MetaAdAccount } from '@modules/crm/meta-ads/domain/entities/meta-ad-account.entity';

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
    private readonly metaAdAccountCommandRepo: IMetaAdAccountCommandRepository,
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly metaAdAccountQueryRepo: IMetaAdAccountQueryRepository,
    @Inject(META_ADS_EVENT_PUBLISHER)
    private readonly eventPublisher: IMetaAdsEventPublisher,
    @Inject(META_MARKETING_API_SERVICE)
    private readonly metaMarketingApi: IMetaMarketingApiService,
    private readonly tokenCipher: TokenCipherService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly txManager: TransactionManager
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

    const shortLived = await this.metaMarketingApi.exchangeCodeForToken(
      code,
      appId,
      appSecret,
      redirectUri
    );
    const longLived = await this.metaMarketingApi.extendToLongLivedToken(
      shortLived.accessToken,
      appId,
      appSecret
    );

    const [adAccounts, pages] = await Promise.all([
      this.metaMarketingApi.getAdAccounts(longLived.accessToken),
      this.metaMarketingApi.getPages(longLived.accessToken),
    ]);

    const encryptedToken = this.tokenCipher.encrypt(longLived.accessToken);
    const firstPage = pages[0];

    let connectedAccounts = 0;

    for (const adAccount of adAccounts) {
      const existing =
        await this.metaAdAccountQueryRepo.findByClinicAndAdAccountId(
          clinicId,
          adAccount.id
        );
      if (existing) continue;

      const metaAdAccount = MetaAdAccount.create({
        clinicId,
        adAccountId: adAccount.id,
        accessToken: encryptedToken,
        tokenExpiresAt: longLived.expiresAt,
        pageId: firstPage?.id ?? null,
        businessName: adAccount.name ?? null,
      });

      await this.txManager.run(async () => {
        await this.metaAdAccountCommandRepo.create(metaAdAccount);
      });

      connectedAccounts++;
    }

    this.logger.log(
      `OAuth callback: ${connectedAccounts} hesap bağlandı (clinic: ${clinicId})`
    );

    return { connectedAccounts };
  }
}
