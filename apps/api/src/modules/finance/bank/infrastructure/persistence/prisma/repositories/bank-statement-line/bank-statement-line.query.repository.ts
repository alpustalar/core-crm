import { Injectable } from '@nestjs/common';
import { BankStatementLine as IBankStatementLine } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IBankStatementLineQueryRepository } from '@modules/finance/bank/domain/repositories/bank-statement-line/bank-statement-line.repository';

@Injectable()
export class BankStatementLineQueryRepository
  extends BaseRepository
  implements IBankStatementLineQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<IBankStatementLine | null> {
    return this.db.bankStatementLine.findUnique({ where: { id } });
  }
}
