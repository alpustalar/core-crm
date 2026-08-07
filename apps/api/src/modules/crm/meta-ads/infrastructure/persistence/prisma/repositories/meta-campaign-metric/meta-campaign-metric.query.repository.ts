import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  AggregateCampaignMetricsFilter,
  IMetaCampaignMetricQueryRepository,
} from '@modules/crm/meta-ads/domain/repositories/meta-campaign-metric.repository';
import { MetaCampaignMetric as IMetaCampaignMetric } from '@shared';

@Injectable()
export class MetaCampaignMetricQueryRepository
  extends BaseRepository
  implements IMetaCampaignMetricQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  aggregateByAccount(
    filter: AggregateCampaignMetricsFilter
  ): Promise<IMetaCampaignMetric[]> {
    const where: Prisma.MetaCampaignMetricWhereInput = {
      metaAdAccount: { clinicId: filter.clinicId, isActive: true },
      date: { gte: filter.from, lte: filter.to },
      ...(filter.campaignId ? { campaignId: filter.campaignId } : {}),
    };

    return this.db.metaCampaignMetric.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }
}
