import { Injectable } from '@nestjs/common';
import { BankStatementLineMatchStatus } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
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

  async update(entity: BankStatementLine): Promise<BankStatementLine> {
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

  async findUnmatchedByStatementId(
    bankStatementId: string
  ): Promise<BankStatementLine[]> {
    const rows = await this.db.bankStatementLine.findMany({
      where: {
        bankStatementId,
        matchStatus: BankStatementLineMatchStatus.UNMATCHED,
      },
      orderBy: { transactionDate: 'asc' },
    });
    return rows.map((raw) => new BankStatementLine(raw));
  }

  async findUsedMatchRefs(clinicId: string, refs: string[]): Promise<string[]> {
    if (refs.length === 0) return [];
    const rows = await this.db.bankStatementLine.findMany({
      where: {
        clinicId,
        matchStatus: BankStatementLineMatchStatus.MATCHED,
        matchedRef: { in: refs },
      },
      select: { matchedRef: true },
    });
    return rows
      .map((row) => row.matchedRef)
      .filter((ref): ref is string => ref !== null);
  }

  async updateMany(entities: BankStatementLine[]): Promise<void> {
    if (entities.length === 0) return;

    const queries = entities.map((entity) => {
      const { id, ...update } = entity.toPersistence();
      return this.db.bankStatementLine.update({ where: { id }, data: update });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(queries);
    } else {
      await this.prisma.$transaction(queries);
    }

    entities.forEach((entity) => entity.flushEvents());
  }
}
