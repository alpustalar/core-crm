import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { ILeadQueryRepository } from '@modules/crm/lead/domain/repositories/lead.repository.interface';
import { Lead } from '@modules/crm/lead/domain/entities/lead.entity';
import { FindLeadsFilter } from '@modules/crm/lead/domain/lead-contracts';

@Injectable()
export class LeadQueryRepository
  extends BaseRepository
  implements ILeadQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Lead | null> {
    const raw = await this.db.lead.findUnique({ where: { id } });
    return raw ? new Lead(raw) : null;
  }

  async findMany(
    filter: FindLeadsFilter
  ): Promise<{ items: Lead[]; total: number }> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.status) where.status = filter.status;
    if (filter.source) where.source = filter.source;
    if (filter.assignedToId) where.assignedToId = filter.assignedToId;

    const result = await paginate({
      delegate: this.db.lead,
      pagination: filter.pagination,
      where,
    });

    return this.mapPagination(result, (r) => new Lead(r));
  }
}
