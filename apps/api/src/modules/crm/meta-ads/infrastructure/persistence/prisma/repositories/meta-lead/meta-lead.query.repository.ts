import { Injectable } from '@nestjs/common';
import { MetaLeadStatus } from '@prisma/client';
import { MetaLead as IMetaLead } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IMetaLeadQueryRepository } from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository';
import { FindMetaLeadsFilter } from '@modules/crm/meta-ads/domain/contracts/meta-ads.contracts';

/**
 * Okuma tarafı: entity hidrate edilmez. Idempotentlik ve dönüşüm işaretleme
 * okumaları (mutasyonu besleyen) Command Repo'dadır.
 */
@Injectable()
export class MetaLeadQueryRepository
  extends BaseRepository
  implements IMetaLeadQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findMany(
    filter: FindMetaLeadsFilter
  ): Promise<{ items: IMetaLead[]; total: number }> {
    const where: Record<string, unknown> = {
      metaAdAccount: { clinicId: filter.clinicId },
    };
    if (filter.status) where.status = filter.status;

    return paginate({
      delegate: this.db.metaLead,
      pagination: filter.pagination,
      where,
    });
  }

  countByAccountAndStatus(
    metaAdAccountId: string,
    status: string
  ): Promise<number> {
    return this.db.metaLead.count({
      where: { metaAdAccountId, status: status as MetaLeadStatus },
    });
  }
}
