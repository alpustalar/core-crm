import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { SyncCampaignMetricsCommand } from './sync-campaign-metrics.command';
import { SyncCampaignMetricsResponse } from './sync-campaign-metrics.response';
import {
  META_AD_ACCOUNT_QUERY_REPOSITORY,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
  IMetaAdAccountQueryRepository,
  IMetaAdAccountCommandRepository,
} from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import {
  META_CAMPAIGN_METRIC_COMMAND_REPOSITORY,
  IMetaCampaignMetricCommandRepository,
} from '@modules/meta-ads/domain/repositories/meta-campaign-metric.repository.interface';
import { MetaMarketingApiService } from '@modules/meta-ads/infrastructure/http/meta-marketing-api.service';
import { TokenCipherService } from '@modules/meta-ads/infrastructure/crypto/token-cipher.service';
import { DateTimeManager } from '@common/utils';

@CommandHandler(SyncCampaignMetricsCommand)
export class SyncCampaignMetricsHandler
  implements
    ICommandHandler<SyncCampaignMetricsCommand, SyncCampaignMetricsResponse>
{
  private readonly logger = new Logger(SyncCampaignMetricsHandler.name);

  constructor(
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IMetaAdAccountQueryRepository,
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IMetaAdAccountCommandRepository,
    @Inject(META_CAMPAIGN_METRIC_COMMAND_REPOSITORY)
    private readonly metricCommandRepo: IMetaCampaignMetricCommandRepository,
    private readonly metaApi: MetaMarketingApiService,
    private readonly tokenCipher: TokenCipherService,
  ) {}

  async execute(
    command: SyncCampaignMetricsCommand,
  ): Promise<SyncCampaignMetricsResponse> {
    const accounts = command.clinicId
      ? await this.accountQueryRepo.findByClinicId(command.clinicId)
      : await this.accountQueryRepo.findAllActive();

    const yesterday = DateTimeManager.subtractDays(new Date(), 1);
    const dateStr = DateTimeManager.toDateString(yesterday);

    let syncedMetrics = 0;

    for (const account of accounts) {
      try {
        const token = this.tokenCipher.decrypt(account.accessToken);
        const insights = await this.metaApi.getCampaignInsights(
          account.adAccountId,
          token,
          dateStr,
          dateStr,
        );

        if (insights.length > 0) {
          await this.metricCommandRepo.upsertMany(
            insights.map((insight) => ({
              id: randomUUID(),
              metaAdAccountId: account.id,
              campaignId: insight.campaign_id,
              campaignName: insight.campaign_name,
              date: new Date(insight.date_start),
              spend: parseFloat(insight.spend ?? '0'),
              clicks: parseInt(insight.clicks ?? '0', 10),
              impressions: parseInt(insight.impressions ?? '0', 10),
              cpc: insight.cpc ? parseFloat(insight.cpc) : null,
              ctr: insight.ctr ? parseFloat(insight.ctr) : null,
            })),
          );
          syncedMetrics += insights.length;
        }

        const updatedAccount = account;
        updatedAccount.markSynced();
        await this.accountCommandRepo.save(updatedAccount);
      } catch (err) {
        this.logger.error(
          `Meta Ads senkronizasyonu başarısız: ${account.adAccountId}`,
          err,
        );
      }
    }

    return { syncedAccounts: accounts.length, syncedMetrics };
  }
}
