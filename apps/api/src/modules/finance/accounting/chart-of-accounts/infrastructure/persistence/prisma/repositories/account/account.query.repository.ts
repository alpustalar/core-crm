import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IAccountQueryRepository } from '@modules/finance/accounting/chart-of-accounts/domain/repositories/account.repository';
import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';

@Injectable()
export class AccountQueryRepository
  extends BaseRepository
  implements IAccountQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Account | null> {
    const raw = await this.db.account.findUnique({ where: { id } });
    return raw ? new Account(raw) : null;
  }

  async findByCode(
    organizationId: string,
    code: string
  ): Promise<Account | null> {
    const raw = await this.db.account.findUnique({
      where: { organizationId_code: { organizationId, code } },
    });
    return raw ? new Account(raw) : null;
  }

  async findAllByOrganizationId(organizationId: string): Promise<Account[]> {
    const rows = await this.db.account.findMany({
      where: { organizationId },
      orderBy: { code: 'asc' },
    });
    return rows.map((raw) => new Account(raw));
  }

  async existsForOrganization(organizationId: string): Promise<boolean> {
    const count = await this.db.account.count({ where: { organizationId } });
    return count > 0;
  }
}
