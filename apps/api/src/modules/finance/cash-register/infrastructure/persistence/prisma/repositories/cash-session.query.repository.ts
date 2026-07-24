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

  async findById(id: string): Promise<ICashSession | null> {
    const raw = await this.db.cashSession.findUnique({ where: { id } });
    return raw ? (raw as unknown as ICashSession) : null;
  }

  async findByIdWithMovements(
    id: string
  ): Promise<CashSessionWithMovements | null> {
    const raw = await this.db.cashSession.findUnique({
      where: { id },
      include: { movements: { orderBy: { occurredAt: 'asc' } } },
    });
    return raw ? (raw as unknown as CashSessionWithMovements) : null;
  }

  async findByClinic(
    filter: FindCashSessionsFilter
  ): Promise<Paginated<ICashSession>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.cashRegisterId) where.cashRegisterId = filter.cashRegisterId;
    if (filter.status) where.status = filter.status;

    const result = await paginate({
      delegate: this.db.cashSession,
      pagination: filter.pagination,
      where,
    });

    return {
      items: result.items as unknown as ICashSession[],
      total: result.total,
    };
  }

  async findOpenByRegister(
    cashRegisterId: string
  ): Promise<ICashSession | null> {
    const raw = await this.db.cashSession.findFirst({
      where: { cashRegisterId, status: 'OPEN' },
    });
    return raw ? (raw as unknown as ICashSession) : null;
  }
}
