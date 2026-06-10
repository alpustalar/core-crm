import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IFinancialEventQueryRepository } from '@modules/finance/accounting/financial-events/domain/repositories/financial-event.repository';
import { FinancialEvent } from '@modules/finance/accounting/financial-events/domain/entities/financial-event.entity';
import { FindFinancialEventsFilter } from '@modules/finance/accounting/financial-events/domain/types/find-financial-events.filter';

@Injectable()
export class FinancialEventQueryRepository
  extends BaseRepository
  implements IFinancialEventQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<FinancialEvent | null> {
    const raw = await this.db.financialEvent.findUnique({ where: { id } });
    return raw ? new FinancialEvent(raw) : null;
  }

  async findByDedupeKey(dedupeKey: string): Promise<FinancialEvent | null> {
    const raw = await this.db.financialEvent.findUnique({
      where: { dedupeKey },
    });
    return raw ? new FinancialEvent(raw) : null;
  }

  async findMany(
    filter: FindFinancialEventsFilter,
    pagination: Pagination
  ): Promise<{ items: FinancialEvent[]; total: number }> {
    const where: Prisma.FinancialEventWhereInput = {
      organizationId: filter.organizationId,
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.sourceModule ? { sourceModule: filter.sourceModule } : {}),
      ...(filter.sourceRefId ? { sourceRefId: filter.sourceRefId } : {}),
    };

    const result = await paginate({
      delegate: this.db.financialEvent,
      pagination,
      where,
    });

    return {
      items: result.items.map((raw) => new FinancialEvent(raw)),
      total: result.total,
    };
  }
}
