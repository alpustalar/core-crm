import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IBankStatementCommandRepository } from '@modules/finance/bank/domain/repositories/bank-statement.repository';
import { BankStatement } from '@modules/finance/bank/domain/entities/bank-statement.entity';
import { BankStatementLine } from '@modules/finance/bank/domain/entities/bank-statement-line.entity';
import { BankStatement as IBankStatement } from '@model-schema/BankStatementSchema';
import { BankStatementLine as IBankStatementLine } from '@model-schema/BankStatementLineSchema';

@Injectable()
export class BankStatementCommandRepository
  extends BaseCommandRepository<BankStatement>
  implements IBankStatementCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: BankStatement): Promise<BankStatement> {
    const header = entity.toPersistence();
    const raw = await this.db.bankStatement.create({
      data: {
        ...header,
        lines: {
          create: entity.lines.map((line) => {
            const { bankStatementId, ...lineData } = line.toPersistence();
            return lineData;
          }),
        },
      },
      include: { lines: { orderBy: { transactionDate: 'asc' } } },
    });
    entity.flushEvents();
    return this.toEntity(raw);
  }

  async update(entity: BankStatement): Promise<BankStatement> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.bankStatement.update({
      where: { id },
      data: update,
      include: { lines: { orderBy: { transactionDate: 'asc' } } },
    });
    entity.flushEvents();
    return this.toEntity(raw);
  }

  async findById(id: string): Promise<BankStatement | null> {
    const raw = await this.db.bankStatement.findUnique({
      where: { id },
      include: { lines: { orderBy: { transactionDate: 'asc' } } },
    });
    return raw ? this.toEntity(raw) : null;
  }

  private toEntity(
    raw: IBankStatement & { lines: IBankStatementLine[] }
  ): BankStatement {
    const { lines, ...header } = raw;
    return new BankStatement(
      header,
      lines.map((line) => new BankStatementLine(line))
    );
  }
}
