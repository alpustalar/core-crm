import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { ICashRegisterQueryRepository } from '@modules/finance/cash-register/domain/repositories/cash-register.repository';
import { FindCashRegistersFilter } from '@modules/finance/cash-register/domain/contracts/cash-register.contracts';
import { CashRegister as ICashRegister } from '@model-schema/CashRegisterSchema';
import { Paginated } from '@common/interfaces/paginated.type';

@Injectable()
export class CashRegisterQueryRepository
  extends BaseRepository
  implements ICashRegisterQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ICashRegister | null> {
    const raw = await this.db.cashRegister.findUnique({ where: { id } });
    return raw ? (raw as unknown as ICashRegister) : null;
  }

  async findByClinic(
    filter: FindCashRegistersFilter
  ): Promise<Paginated<ICashRegister>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.status) where.status = filter.status;

    const result = await paginate({
      delegate: this.db.cashRegister,
      pagination: filter.pagination,
      where,
    });

    return {
      items: result.items as unknown as ICashRegister[],
      total: result.total,
    };
  }
}
