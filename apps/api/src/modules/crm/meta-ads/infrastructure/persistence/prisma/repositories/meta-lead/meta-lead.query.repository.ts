import { Injectable } from '@nestjs/common';
import { MetaLeadStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IMetaLeadQueryRepository } from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository.interface';
import { MetaLead } from '@modules/crm/meta-ads/domain/entities/meta-lead.entity';
import { FindMetaLeadsFilter } from '@modules/crm/meta-ads/domain/contracts/meta-ads.contracts';

@Injectable()
export class MetaLeadQueryRepository
  extends BaseRepository
  implements IMetaLeadQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<MetaLead | null> {
    const raw = await this.db.metaLead.findUnique({ where: { id } });
    return raw ? new MetaLead(raw) : null;
  }

  async findByMetaLeadId(metaLeadId: string): Promise<MetaLead | null> {
    const raw = await this.db.metaLead.findUnique({ where: { metaLeadId } });
    return raw ? new MetaLead(raw) : null;
  }

  async findMatchedLeadByPatientId(
    patientId: string
  ): Promise<MetaLead | null> {
    const raw = await this.db.metaLead.findFirst({
      where: { matchedPatientId: patientId, status: MetaLeadStatus.MATCHED },
      orderBy: { createdAt: 'desc' },
    });
    return raw ? new MetaLead(raw) : null;
  }

  async findByPhone(phone: string, clinicId: string): Promise<MetaLead | null> {
    const raw = await this.db.metaLead.findFirst({
      where: {
        phone,
        metaAdAccount: { clinicId },
      },
      orderBy: { createdAt: 'desc' },
    });
    return raw ? new MetaLead(raw) : null;
  }

  async findByEmail(email: string, clinicId: string): Promise<MetaLead | null> {
    const raw = await this.db.metaLead.findFirst({
      where: {
        email,
        metaAdAccount: { clinicId },
      },
      orderBy: { createdAt: 'desc' },
    });
    return raw ? new MetaLead(raw) : null;
  }

  async findMany(
    filter: FindMetaLeadsFilter
  ): Promise<{ items: MetaLead[]; total: number }> {
    const where: Record<string, unknown> = {
      metaAdAccount: { clinicId: filter.clinicId },
    };
    if (filter.status) where.status = filter.status;

    const result = await paginate({
      delegate: this.db.metaLead,
      pagination: filter.pagination,
      where,
    });

    return this.mapPagination(result, (r) => new MetaLead(r));
  }

  async countByAccountAndStatus(
    metaAdAccountId: string,
    status: string
  ): Promise<number> {
    return this.db.metaLead.count({
      where: { metaAdAccountId, status: status as MetaLeadStatus },
    });
  }
}
