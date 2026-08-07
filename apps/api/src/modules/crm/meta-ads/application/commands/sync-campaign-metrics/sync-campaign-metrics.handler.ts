import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { SyncCampaignMetricsCommand } from './sync-campaign-metrics.command';
import { SyncCampaignMetricsResponse } from './sync-campaign-metrics.response';
import {
  IMetaAdAccountCommandRepository,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IMetaCampaignMetricCommandRepository,
  META_CAMPAIGN_METRIC_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-campaign-metric.repository';
import {
  IMetaMarketingApiService,
  META_MARKETING_API_SERVICE,
} from '@modules/crm/meta-ads/domain/interfaces/meta-marketing-api.interface';
import { TokenCipherService } from '@src/infrastructure/security/crypto/token-cipher.service';
import { DateTimeManager } from '@common/utils';

@CommandHandler(SyncCampaignMetricsCommand)
export class SyncCampaignMetricsHandler implements ICommandHandler<
  SyncCampaignMetricsCommand,
  SyncCampaignMetricsResponse
> {
  private readonly logger = new Logger(SyncCampaignMetricsHandler.name);

  constructor(
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IMetaAdAccountCommandRepository,
    @Inject(META_CAMPAIGN_METRIC_COMMAND_REPOSITORY)
    private readonly metaCampaignMetricCommandRepo: IMetaCampaignMetricCommandRepository,
    @Inject(META_MARKETING_API_SERVICE)
    private readonly metaApi: IMetaMarketingApiService,
    private readonly tokenCipher: TokenCipherService,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: SyncCampaignMetricsCommand
  ): Promise<SyncCampaignMetricsResponse> {
    const accounts = await this.accountCommandRepo.findSyncCandidates(
      command.clinicId
    );

    const yesterday = DateTimeManager.subtractDays(DateTimeManager.create(), 1);
    const dateString = DateTimeManager.toDateString(yesterday);

    let syncedMetrics = 0;

    for (const candidate of accounts) {
      try {
        const token = this.tokenCipher.decrypt(candidate.accessToken);

        // Dış çağrı transaction dışında; metrik yazımı + markSynced tek transaction.
        const insights = await this.metaApi.getCampaignInsights(
          candidate.adAccountId,
          token,
          dateString,
          dateString
        );

        await this.txManager.run(async () => {
          if (insights.length > 0) {
            await this.metaCampaignMetricCommandRepo.updateMany(
              insights.map((insight) => ({
                id: randomUUID(),
                metaAdAccountId: candidate.id.value,
                campaignId: insight.campaign_id,
                campaignName: insight.campaign_name,
                date: new Date(insight.date_start),
                spend: parseFloat(insight.spend ?? '0'),
                clicks: parseInt(insight.clicks ?? '0', 10),
                impressions: parseInt(insight.impressions ?? '0', 10),
                cpc: insight.cpc ? parseFloat(insight.cpc) : null,
                ctr: insight.ctr ? parseFloat(insight.ctr) : null,
              }))
            );
            syncedMetrics += insights.length;
          }

          // Tarama anındaki kopya bayat olabilir (update tüm alanları yazar) →
          // taze oku, işaretle, kaydet.
          const account = await this.accountCommandRepo.findById(
            candidate.id.value
          );
          if (!account) return;
          account.markSynced();
          await this.accountCommandRepo.update(account);
        });
      } catch (err) {
        this.logger.error(
          `Meta Ads senkronizasyonu başarısız: ${candidate.adAccountId}`,
          err
        );
      }
    }

    return { syncedAccounts: accounts.length, syncedMetrics };
  }
}
