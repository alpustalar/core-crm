import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IBankStatementLineCommandRepository } from '@modules/finance/bank/domain/repositories/bank-statement-line.repository';
import { BankStatementLine } from '@modules/finance/bank/domain/entities/bank-statement-line.entity';

@Injectable()
export class BankStatementLineCommandRepository
  extends BaseCommandRepository<BankStatementLine>
  implements IBankStatementLineCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: BankStatementLine): Promise<BankStatementLine> {
    const raw = await this.db.bankStatementLine.create({
      data: entity.toPersistence(),
    });
    entity.flushEvents();
    return new BankStatementLine(raw);
  }

  async save(entity: BankStatementLine): Promise<BankStatementLine> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.bankStatementLine.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new BankStatementLine(raw);
  }

  async findById(id: string): Promise<BankStatementLine | null> {
    const raw = await this.db.bankStatementLine.findUnique({ where: { id } });
    return raw ? new BankStatementLine(raw) : null;
  }
}
