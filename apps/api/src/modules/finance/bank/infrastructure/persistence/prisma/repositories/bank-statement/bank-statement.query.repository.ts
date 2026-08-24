import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IBankStatementQueryRepository } from '@modules/finance/bank/domain/repositories/bank-statement/bank-statement.repository';
import {
  BankStatementWithLines,
  FindBankStatementsFilter,
  ReconciliationSummary,
} from '@modules/finance/bank/domain/contracts';
import { BankStatement as IBankStatement } from '@model-schema/BankStatementSchema';
import { Paginated } from '@common/interfaces/paginated.type';

@Injectable()
export class BankStatementQueryRepository
  extends BaseRepository
  implements IBankStatementQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<IBankStatement | null> {
    const raw = await this.db.bankStatement.findUnique({ where: { id } });
    return raw ? (raw as unknown as IBankStatement) : null;
  }

  async findByIdWithLines(id: string): Promise<BankStatementWithLines | null> {
    const raw = await this.db.bankStatement.findUnique({
      where: { id },
      include: { lines: { orderBy: { transactionDate: 'asc' } } },
    });
    return raw ? (raw as unknown as BankStatementWithLines) : null;
  }

  async findByClinic(
    filter: FindBankStatementsFilter
  ): Promise<Paginated<IBankStatement>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.bankAccountId) where.bankAccountId = filter.bankAccountId;

    const result = await paginate({
      delegate: this.db.bankStatement,
      pagination: filter.pagination,
      where,
    });

    return {
      items: result.items as unknown as IBankStatement[],
      total: result.total,
    };
  }

  async reconciliationSummary(
    bankStatementId: string
  ): Promise<ReconciliationSummary> {
    const groups = await this.db.bankStatementLine.groupBy({
      by: ['matchStatus'],
      where: { bankStatementId },
      _count: { _all: true },
      _sum: { amount: true },
    });

    let totalLines = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;
    let ignoredCount = 0;
    let statementNet = new Decimal(0);
    let matchedNet = new Decimal(0);
    let unmatchedNet = new Decimal(0);

    for (const group of groups) {
      const count = group._count._all;
      const sum = new Decimal((group._sum.amount ?? 0).toString());
      totalLines += count;
      statementNet = statementNet.plus(sum);

      if (group.matchStatus === 'MATCHED') {
        matchedCount = count;
        matchedNet = sum;
      } else if (group.matchStatus === 'UNMATCHED') {
        unmatchedCount = count;
        unmatchedNet = sum;
      } else if (group.matchStatus === 'IGNORED') {
        ignoredCount = count;
      }
    }

    return {
      bankStatementId,
      totalLines,
      matchedCount,
      unmatchedCount,
      ignoredCount,
      statementNet: statementNet.toFixed(2),
      matchedNet: matchedNet.toFixed(2),
      unmatchedNet: unmatchedNet.toFixed(2),
    };
  }
}
