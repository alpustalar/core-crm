import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetaReportQuery } from './get-meta-report.query';
import { GetMetaReportResponse } from './get-meta-report.response';
import {
  META_CAMPAIGN_METRIC_QUERY_REPOSITORY,
  IMetaCampaignMetricQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-campaign-metric.repository.interface';
import {
  META_LEAD_QUERY_REPOSITORY,
  IMetaLeadQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-lead.repository.interface';
import {
  META_AD_ACCOUNT_QUERY_REPOSITORY,
  IMetaAdAccountQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';

@QueryHandler(GetMetaReportQuery)
export class GetMetaReportHandler
  implements IQueryHandler<GetMetaReportQuery, GetMetaReportResponse>
{
  constructor(
    @Inject(META_CAMPAIGN_METRIC_QUERY_REPOSITORY)
    private readonly metricQueryRepo: IMetaCampaignMetricQueryRepository,
    @Inject(META_LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: IMetaLeadQueryRepository,
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IMetaAdAccountQueryRepository,
  ) {}

  async execute(query: GetMetaReportQuery): Promise<GetMetaReportResponse> {
    const { clinicId, from, to, campaignId } = query;

    const [metrics, accounts] = await Promise.all([
      this.metricQueryRepo.aggregateByAccount({ clinicId, from, to, campaignId }),
      this.accountQueryRepo.findByClinicId(clinicId),
    ]);

    const totalSpend = metrics.reduce(
      (sum, m) => sum + parseFloat(m.spend.toString()),
      0,
    );
    const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
    const averageCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;

    const accountIds = accounts.map((a) => a.id);
    const [totalLeads, convertedLeads] = await Promise.all([
      this.countLeadsByAccounts(accountIds, from, to),
      this.countConvertedLeadsByAccounts(accountIds, from, to),
    ]);

    const costPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const costPerAppointment =
      convertedLeads > 0 ? totalSpend / convertedLeads : 0;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const campaignMap = new Map<
      string,
      { spend: number; clicks: number; leads: number; conversions: number; name: string }
    >();

    for (const m of metrics) {
      const existing = campaignMap.get(m.campaignId) ?? {
        spend: 0,
        clicks: 0,
        leads: 0,
        conversions: 0,
        name: m.campaignName,
      };
      existing.spend += parseFloat(m.spend.toString());
      existing.clicks += m.clicks;
      campaignMap.set(m.campaignId, existing);
    }

    const campaigns = Array.from(campaignMap.entries()).map(
      ([campaignId, data]) => ({
        campaignId,
        campaignName: data.name,
        spend: data.spend,
        clicks: data.clicks,
        cpc: data.clicks > 0 ? data.spend / data.clicks : 0,
        leads: data.leads,
        conversions: data.conversions,
      }),
    );

    return {
      data: {
        period: { from, to },
        totalSpend,
        totalClicks,
        averageCpc,
        totalLeads,
        convertedLeads,
        costPerLead,
        costPerAppointment,
        conversionRate,
        campaigns,
      },
    };
  }

  private async countLeadsByAccounts(
    accountIds: string[],
    from: Date,
    to: Date,
  ): Promise<number> {
    if (accountIds.length === 0) return 0;
    let total = 0;
    for (const accountId of accountIds) {
      const result = await this.leadQueryRepo.countByAccountAndStatus(
        accountId,
        'NEW',
      );
      const matched = await this.leadQueryRepo.countByAccountAndStatus(
        accountId,
        'MATCHED',
      );
      const converted = await this.leadQueryRepo.countByAccountAndStatus(
        accountId,
        'CONVERTED',
      );
      total += result + matched + converted;
    }
    return total;
  }

  private async countConvertedLeadsByAccounts(
    accountIds: string[],
    _from: Date,
    _to: Date,
  ): Promise<number> {
    if (accountIds.length === 0) return 0;
    let total = 0;
    for (const accountId of accountIds) {
      const converted = await this.leadQueryRepo.countByAccountAndStatus(
        accountId,
        'CONVERTED',
      );
      total += converted;
    }
    return total;
  }
}
