import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IAccountingPeriodCommandRepository } from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { AccountingPeriod } from '@modules/finance/accounting/periods/domain/entities/accounting-period.entity';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { Promise } from 'mongoose';

@Injectable()
export class AccountingPeriodCommandRepository
  extends BaseCommandRepository<AccountingPeriod>
  implements IAccountingPeriodCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  async findById(id: string): Promise<AccountingPeriod | null> {
    const raw = await this.db.accountingPeriod.findUnique({ where: { id } });
    return raw ? new AccountingPeriod(raw) : null;
  }

  async create(period: AccountingPeriod): Promise<AccountingPeriod> {
    const data = period.toPersistence();
    const raw = await this.db.accountingPeriod.create({ data });
    period.flushEvents();
    return new AccountingPeriod(raw);
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
