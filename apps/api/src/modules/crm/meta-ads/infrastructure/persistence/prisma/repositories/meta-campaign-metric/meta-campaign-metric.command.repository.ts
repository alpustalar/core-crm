import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaCampaignMetricCommandRepository } from '@modules/crm/meta-ads/domain/repositories/meta-campaign-metric.repository.interface';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { UpsertCampaignMetricData } from '@modules/crm/meta-ads/domain/meta-ads.contracts';

@Injectable()
export class MetaCampaignMetricCommandRepository
  extends BaseRepository
  implements IMetaCampaignMetricCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async saveMany(data: UpsertCampaignMetricData[]): Promise<void> {
    await Promise.all(
      data.map((p) =>
        this.db.metaCampaignMetric.upsert({
          where: {
            metaAdAccountId_campaignId_date: {
              metaAdAccountId: p.metaAdAccountId,
              campaignId: p.campaignId,
              date: p.date,
            },
          },
          create: {
            id: p.id,
            metaAdAccountId: p.metaAdAccountId,
            campaignId: p.campaignId,
            campaignName: p.campaignName,
            date: p.date,
            spend: new Prisma.Decimal(p.spend),
            clicks: p.clicks,
            impressions: p.impressions,
            cpc: p.cpc != null ? new Prisma.Decimal(p.cpc) : null,
            ctr: p.ctr != null ? new Prisma.Decimal(p.ctr) : null,
            currency:
              Currency.create(p.currency)?.instance?.value ?? Currency.enum.TRY,
          },
          update: {
            campaignName: p.campaignName,
            spend: new Prisma.Decimal(p.spend),
            clicks: p.clicks,
            impressions: p.impressions,
            cpc: p.cpc != null ? new Prisma.Decimal(p.cpc) : null,
            ctr: p.ctr != null ? new Prisma.Decimal(p.ctr) : null,
          },
        })
      )
    );
  }
}
