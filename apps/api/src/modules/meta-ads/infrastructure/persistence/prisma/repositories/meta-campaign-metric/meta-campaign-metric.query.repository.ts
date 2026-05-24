import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaCampaignMetricQueryRepository } from '@modules/meta-ads/domain/repositories/meta-campaign-metric.repository.interface';
import { MetaCampaignMetric } from '@modules/meta-ads/domain/entities/meta-campaign-metric.entity';

@Injectable()
export class MetaCampaignMetricQueryRepository
  extends BaseRepository
  implements IMetaCampaignMetricQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByAccountAndDateRange(props: {
    metaAdAccountId: string;
    from: Date;
    to: Date;
    campaignId?: string;
  }): Promise<MetaCampaignMetric[]> {
    const where: Record<string, unknown> = {
      metaAdAccountId: props.metaAdAccountId,
      date: { gte: props.from, lte: props.to },
    };
    if (props.campaignId) where.campaignId = props.campaignId;

    const rows = await this.db.metaCampaignMetric.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    return rows.map((r) => new MetaCampaignMetric(r));
  }

  async aggregateByAccount(props: {
    clinicId: string;
    from: Date;
    to: Date;
    campaignId?: string;
  }): Promise<MetaCampaignMetric[]> {
    const where: Record<string, unknown> = {
      metaAdAccount: { clinicId: props.clinicId, isActive: true },
      date: { gte: props.from, lte: props.to },
    };
    if (props.campaignId) where.campaignId = props.campaignId;

    const rows = await this.db.metaCampaignMetric.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    return rows.map((r) => new MetaCampaignMetric(r));
  }
}
