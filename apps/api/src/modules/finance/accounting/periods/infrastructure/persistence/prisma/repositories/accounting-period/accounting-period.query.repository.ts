import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IAccountingPeriodQueryRepository } from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { AccountingPeriod } from '@modules/finance/accounting/periods/domain/entities/accounting-period.entity';

@Injectable()
export class AccountingPeriodQueryRepository
  extends BaseRepository
  implements IAccountingPeriodQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<AccountingPeriod | null> {
    const raw = await this.db.accountingPeriod.findUnique({ where: { id } });
    return raw ? new AccountingPeriod(raw) : null;
  }

  async findByYear(
    organizationId: string,
    year: number
  ): Promise<AccountingPeriod | null> {
    const raw = await this.db.accountingPeriod.findUnique({
      where: { organizationId_year: { organizationId, year } },
    });
    return raw ? new AccountingPeriod(raw) : null;
  }

  async findByDate(
    organizationId: string,
    date: Date
  ): Promise<AccountingPeriod | null> {
    const raw = await this.db.accountingPeriod.findFirst({
      where: {
        organizationId,
        startsAt: { lte: date },
        endsAt: { gte: date },
      },
    });
    return raw ? new AccountingPeriod(raw) : null;
  }

  async findAllByOrganizationId(
    organizationId: string
  ): Promise<AccountingPeriod[]> {
    const rows = await this.db.accountingPeriod.findMany({
      where: { organizationId },
      orderBy: { year: 'desc' },
    });
    return rows.map((raw) => new AccountingPeriod(raw));
  }
}
