import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IAccountingPeriodCommandRepository } from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { AccountingPeriod } from '@modules/finance/accounting/periods/domain/entities/accounting-period.entity';

@Injectable()
export class AccountingPeriodCommandRepository
  extends BaseRepository
  implements IAccountingPeriodCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(period: AccountingPeriod): Promise<AccountingPeriod> {
    const data = period.toPersistence();
    const raw = await this.db.accountingPeriod.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
    period.flushEvents();
    return new AccountingPeriod(raw);
  }
}
