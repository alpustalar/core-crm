import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindBankAccountsFilter } from '@modules/finance/bank/domain/contracts';
import { BankAccount as IBankAccount } from '@model-schema/BankAccountSchema';
import { Paginated } from '@common/interfaces/paginated.type';
import { IBankAccountQueryRepository } from '@modules/finance/bank/domain/repositories/bank-account/bank-account.query.repository';

@Injectable()
export class BankAccountQueryRepository
  extends BaseRepository
  implements IBankAccountQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<IBankAccount | null> {
    const raw = await this.db.bankAccount.findUnique({ where: { id } });
    return raw ? (raw as unknown as IBankAccount) : null;
  }

  async findByClinic(
    filter: FindBankAccountsFilter
  ): Promise<Paginated<IBankAccount>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.status) where.status = filter.status;

    const result = await paginate({
      delegate: this.db.bankAccount,
      pagination: filter.pagination,
      where,
    });

    return {
      items: result.items as unknown as IBankAccount[],
      total: result.total,
    };
  }
}
