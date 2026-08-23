import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import {
  RefreshMetaTokensCommand,
  RefreshMetaTokensResponse,
} from './refresh-meta-tokens.command';
import {
  IMetaAdAccountCommandRepository,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IMetaMarketingApiService,
  META_MARKETING_API_SERVICE,
} from '@modules/crm/meta-ads/domain/interfaces/meta-marketing-api.interface';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import { ENV } from '@common/constants/env.constant';
import { CriticalFailurePublisher } from '@common/observability/critical-failure.publisher';

const REFRESH_WITHIN_DAYS = 7;

@CommandHandler(RefreshMetaTokensCommand)
export class RefreshMetaTokensHandler
  implements
    ICommandHandler<RefreshMetaTokensCommand, RefreshMetaTokensResponse>
{
  private readonly logger = new Logger(RefreshMetaTokensHandler.name);

  constructor(
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IMetaAdAccountCommandRepository,
    @Inject(META_MARKETING_API_SERVICE)
    private readonly metaApi: IMetaMarketingApiService,
    private readonly tokenCipher: TokenCipherService,
    private readonly config: ConfigService,
    private readonly txManager: TransactionManager,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {}

  async execute(): Promise<RefreshMetaTokensResponse> {
    const accounts =
      await this.accountCommandRepo.findExpiringSoon(REFRESH_WITHIN_DAYS);

    const appId = this.config.getOrThrow<string>(ENV.META_APP_ID);
    const appSecret = this.config.getOrThrow<string>(ENV.META_APP_SECRET);

    let refreshed = 0;
    let failed = 0;

    for (const candidate of accounts) {
      try {
        const currentToken = this.tokenCipher.decrypt(candidate.accessToken);
        // Dış çağrı transaction dışında: tarama ile yazma arasında geçen sürede
        // hesap değişmiş olabilir, o yüzden kayıt tazeden okunup güncellenir
        // (update tüm alanları yazar → bayat kopya diğer değişiklikleri ezerdi).
        const result = await this.metaApi.extendToLongLivedToken(
          currentToken,
          appId,
          appSecret
        );

        const encryptedToken = this.tokenCipher.encrypt(result.accessToken);

        await this.txManager.run(async () => {
          const account = await this.accountCommandRepo.findById(
            candidate.id.value
          );
          if (!account) return;
          account.refreshToken(encryptedToken, result.expiresAt);
          await this.accountCommandRepo.update(account);
        });

        this.logger.log(
          `Token yenilendi: ${candidate.adAccountId} (expires: ${result.expiresAt?.toISOString() ?? 'unknown'})`
        );
        refreshed++;
      } catch (err) {
        this.logger.error(
          `Token yenileme başarısız: ${candidate.adAccountId}`,
          err
        );
        failed++;
        // Token yenilenmezse süresi dolar ve reklam entegrasyonu (lead akışı +
        // metrikler) sessizce durur; tarama her gün aynı hatayı tekrarlar.
        this.criticalFailure.publish({
          operation: 'meta-ads.token-refresh',
          severity: 'CRITICAL',
          summary:
            'Meta erişim jetonu yenilenemedi; süresi dolunca lead akışı durur.',
          errorMessage: err instanceof Error ? err.message : String(err),
          context: {
            adAccountId: candidate.adAccountId,
            metaAdAccountId: candidate.id.value,
          },
          clinicId: candidate.clinicId.value,
          dedupeKey: `meta-token-refresh-failed:${candidate.id.value}`,
        });
      }
    }

    this.logger.log(
      `Token yenileme tamamlandı — yenilendi: ${refreshed}, hata: ${failed}`
    );
    return { refreshed, failed };
  }
}
