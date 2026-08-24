import { Injectable } from '@nestjs/common';
import { FinancialEvent as IFinancialEvent, Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindFinancialEventsFilter } from '@modules/finance/accounting/financial-events/domain/contracts/financial-event';
import { IFinancialEventQueryRepository } from '@modules/finance/accounting/financial-events/domain/repositories/financial-event/financial-event.query.repository';

@Injectable()
export class FinancialEventQueryRepository
  extends BaseRepository
  implements IFinancialEventQueryRepository
{
  constructor(public readonly prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<IFinancialEvent | null> {
    return this.db.financialEvent.findUnique({ where: { id } });
  }

  findMany(
    filter: FindFinancialEventsFilter,
    pagination: Pagination
  ): Promise<{ items: IFinancialEvent[]; total: number }> {
    const where = {
      organizationId: filter.organizationId,
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.sourceModule ? { sourceModule: filter.sourceModule } : {}),
      ...(filter.sourceRefId ? { sourceRefId: filter.sourceRefId } : {}),
    };

    return paginate({
      delegate: this.db.financialEvent,
      pagination,
      where,
    });
  }
}
