import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindCashRegistersFilter } from '@modules/finance/cash-register/domain/contracts';
import { CashRegister as ICashRegister } from '@model-schema/CashRegisterSchema';
import { Paginated } from '@common/interfaces/paginated.type';
import { ICashRegisterQueryRepository } from '@modules/finance/cash-register/domain/repositories/cash-register/cash-register.query.repository';

@Injectable()
export class CashRegisterQueryRepository
  extends BaseRepository
  implements ICashRegisterQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<ICashRegister | null> {
    return this.db.cashRegister.findUnique({ where: { id } });
  }

  async findByClinic(
    filter: FindCashRegistersFilter
  ): Promise<Paginated<ICashRegister>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.status) where.status = filter.status;

    return await paginate({
      delegate: this.db.cashRegister,
      pagination: filter.pagination,
      where,
    });
  }
}
