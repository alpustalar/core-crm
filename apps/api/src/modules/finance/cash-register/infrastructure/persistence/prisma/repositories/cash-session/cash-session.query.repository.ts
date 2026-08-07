import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { ICashSessionQueryRepository } from '@modules/finance/cash-register/domain/repositories/cash-session.repository';
import {
  CashSessionWithMovements,
  FindCashSessionsFilter,
} from '@modules/finance/cash-register/domain/contracts/cash-register.contracts';
import { CashSession as ICashSession } from '@model-schema/CashSessionSchema';
import { Paginated } from '@common/interfaces/paginated.type';

@Injectable()
export class CashSessionQueryRepository
  extends BaseRepository
  implements ICashSessionQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<ICashSession | null> {
    return this.db.cashSession.findUnique({ where: { id } });
  }

  async findByIdWithMovements(
    id: string
  ): Promise<CashSessionWithMovements | null> {
    return this.db.cashSession.findUnique({
      where: { id },
      include: { movements: { orderBy: { occurredAt: 'asc' } } },
    });
  }

  async findByClinic(
    filter: FindCashSessionsFilter
  ): Promise<Paginated<ICashSession>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.cashRegisterId) where.cashRegisterId = filter.cashRegisterId;
    if (filter.status) where.status = filter.status;

    return await paginate({
      delegate: this.db.cashSession,
      pagination: filter.pagination,
      where,
    });
  }

  findOpenByRegister(cashRegisterId: string): Promise<ICashSession | null> {
    return this.db.cashSession.findFirst({
      where: { cashRegisterId, status: 'OPEN' },
    });
  }
}
