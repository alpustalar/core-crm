import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import {
  RefreshMetaTokensCommand,
  RefreshMetaTokensResponse,
} from './refresh-meta-tokens.command';
import {
  IMetaAdAccountCommandRepository,
  IMetaAdAccountQueryRepository,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import { MetaMarketingApiService } from '@modules/meta-ads/infrastructure/http/meta-marketing-api.service';
import { TokenCipherService } from '@modules/meta-ads/infrastructure/crypto/token-cipher.service';
import { ENV } from '@common/constants/env.constant';

const REFRESH_WITHIN_DAYS = 7;

@CommandHandler(RefreshMetaTokensCommand)
export class RefreshMetaTokensHandler
  implements ICommandHandler<RefreshMetaTokensCommand, RefreshMetaTokensResponse>
{
  private readonly logger = new Logger(RefreshMetaTokensHandler.name);

  constructor(
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IMetaAdAccountQueryRepository,
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IMetaAdAccountCommandRepository,
    private readonly metaApi: MetaMarketingApiService,
    private readonly tokenCipher: TokenCipherService,
    private readonly config: ConfigService,
  ) {}

  async execute(): Promise<RefreshMetaTokensResponse> {
    const accounts = await this.accountQueryRepo.findExpiringSoon(REFRESH_WITHIN_DAYS);

    const appId = this.config.getOrThrow<string>(ENV.META_APP_ID);
    const appSecret = this.config.getOrThrow<string>(ENV.META_APP_SECRET);

    let refreshed = 0;
    let failed = 0;

    for (const account of accounts) {
      try {
        const currentToken = this.tokenCipher.decrypt(account.accessToken);
        const result = await this.metaApi.extendToLongLivedToken(
          currentToken,
          appId,
          appSecret,
        );

        const encryptedToken = this.tokenCipher.encrypt(result.accessToken);
        account.refreshToken(encryptedToken, result.expiresAt);
        await this.accountCommandRepo.save(account);

        this.logger.log(
          `Token yenilendi: ${account.adAccountId} (expires: ${result.expiresAt?.toISOString() ?? 'unknown'})`,
        );
        refreshed++;
      } catch (err) {
        this.logger.error(
          `Token yenileme başarısız: ${account.adAccountId}`,
          err,
        );
        failed++;
      }
    }

    this.logger.log(`Token yenileme tamamlandı — yenilendi: ${refreshed}, hata: ${failed}`);
    return { refreshed, failed };
  }
}
