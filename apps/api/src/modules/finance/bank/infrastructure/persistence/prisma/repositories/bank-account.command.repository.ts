import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IBankAccountCommandRepository } from '@modules/finance/bank/domain/repositories/bank-account.repository';
import { BankAccount } from '@modules/finance/bank/domain/entities/bank-account.entity';

@Injectable()
export class BankAccountCommandRepository
  extends BaseCommandRepository<BankAccount>
  implements IBankAccountCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: BankAccount): Promise<BankAccount> {
    const raw = await this.db.bankAccount.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new BankAccount(raw);
  }

  async update(entity: BankAccount): Promise<BankAccount> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.bankAccount.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new BankAccount(raw);
  }

  async findById(id: string): Promise<BankAccount | null> {
    const raw = await this.db.bankAccount.findUnique({ where: { id } });
    return raw ? new BankAccount(raw) : null;
  }
}
