import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';
import { IAccountCommandRepository } from '@modules/finance/accounting/chart-of-accounts/domain/repositories/account/account.command.repository';

@Injectable()
export class AccountCommandRepository
  extends BaseRepository
  implements IAccountCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async existsForClinic(clinicId: string): Promise<boolean> {
    const count = await this.db.account.count({ where: { clinicId } });
    return count > 0;
  }

  async update(account: Account): Promise<Account> {
    const data = account.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.account.update({
      where: { id },
      data: update,
    });
    account.flushEvents();
    return new Account(raw);
  }

  async updateMany(accounts: Account[]): Promise<void> {
    const ops = accounts.map((account) => {
      const data = account.toPersistence();
      return this.db.account.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    });
    if (txStorage.getStore()?.tx) {
      await Promise.all(ops);
    } else {
      await this.prisma.$transaction(ops);
    }
    accounts.forEach((account) => account.flushEvents());
  }

  async createChart(accounts: Account[]): Promise<void> {
    // Self-FK ihlalini önlemek için kökleri (parentId=null) önce ekle.
    const ordered = [...accounts].sort(
      (a, b) => Number(a.parentId !== null) - Number(b.parentId !== null)
    );
    const data = ordered.map((account) => account.toPersistence());

    await this.db.account.createMany({ data, skipDuplicates: true });

    accounts.forEach((account) => account.flushEvents());
  }
}
