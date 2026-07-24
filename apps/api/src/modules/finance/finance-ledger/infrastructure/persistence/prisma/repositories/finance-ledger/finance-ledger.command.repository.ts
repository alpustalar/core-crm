import { Injectable } from '@nestjs/common';
import { LedgerStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import { IFinanceLedgerCommandRepository } from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { FinanceLedgerEntity } from '@modules/finance/finance-ledger/domain/entities/finance-ledger.entity';

@Injectable()
export class FinanceLedgerCommandRepository
  extends BaseRepository
  implements IFinanceLedgerCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entry: FinanceLedgerEntity): Promise<FinanceLedgerEntity> {
    const data = entry.toPersistence();
    const raw = await this.db.financeLedger.create({ data });
    entry.flushEvents();
    return new FinanceLedgerEntity(raw);
  }

  async saveMany(entries: FinanceLedgerEntity[]): Promise<void> {
    const ops = entries.map((entry) => {
      const data = entry.toPersistence();
      return this.db.financeLedger.upsert({
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
    entries.forEach((e) => e.flushEvents());
  }

  async updateStatus(id: string, status: LedgerStatus): Promise<void> {
    await this.db.financeLedger.update({ where: { id }, data: { status } });
  }

  async updateManyStatusByPaymentId(
    paymentId: string,
    status: LedgerStatus
  ): Promise<void> {
    await this.db.financeLedger.updateMany({
      where: { paymentId },
      data: { status },
    });
  }
}
