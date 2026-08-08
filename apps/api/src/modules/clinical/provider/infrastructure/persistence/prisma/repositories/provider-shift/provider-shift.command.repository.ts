import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ProviderShift } from '@modules/clinical/provider/domain/entities/provider-shift.entity';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { Prisma } from '@prisma/client';
import { IProviderShiftCommandRepository } from '@modules/clinical/provider/domain/repositories/provider-shift/provider-shift.command.repository';

@Injectable()
export class ProviderShiftCommandRepository
  extends BaseCommandRepository<ProviderShift>
  implements IProviderShiftCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(providersShift: ProviderShift): Promise<ProviderShift> {
    const data = providersShift.toPersistence();
    const raw = await this.db.providerShift.create({ data });
    providersShift.flushEvents();
    return new ProviderShift(raw);
  }

  async findById(id: string): Promise<ProviderShift | null> {
    const raw = await this.db.providerShift.findUnique({ where: { id } });
    return raw ? new ProviderShift(raw) : null;
  }

  async update(entity: ProviderShift) {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.providerShift.update({
      where: { id },
      data: update,
    });
    entity.flushEvents();
    return new ProviderShift(raw);
  }

  async replaceShiftsForDates(shifts: ProviderShift[]): Promise<void> {
    if (!shifts.length) return;

    const data = shifts.map((shift) => shift.toPersistence());

    // Bu operasyon (providerId + tarihler) kapsamında "tam değiştirme" yapar ve
    // tek provider varsayımına dayanır. Karışık provider gelirse deleteMany
    // yalnızca ilkini temizler, createMany hepsini yazar → sessiz veri bozulması.
    const providerIds = new Set(data.map((d) => d.providerId));
    if (providerIds.size > 1) {
      throw new Error(
        'replaceShiftsForDates yalnızca tek bir provider için çağrılabilir.'
      );
    }

    const providerId = data[0].providerId;
    const dates = data.map((d) => d.date);

    const replace = async (tx: Prisma.TransactionClient) => {
      await tx.providerShift.deleteMany({
        where: { providerId, date: { in: dates } },
      });
      await tx.providerShift.createMany({ data });
    };

    // ALS'de aktif transaction varsa onu kullan (iç içe tx açma); yoksa
    // delete + create'i atomik tutmak için yeni bir $transaction aç.
    // ALS bağlamı veritabanı-bağımsız (`tx?: unknown`); daraltma Prisma'yı bilen
    // bu tarafta yapılır — handle'ı yalnız Prisma'nın `$transaction`'ı yazar.
    const activeTx = txStorage.getStore()?.tx as Prisma.TransactionClient | undefined;
    if (activeTx) {
      await replace(activeTx);
    } else {
      await this.prisma.$transaction((tx) => replace(tx));
    }

    shifts.forEach((s) => s.flushEvents());
  }

  async findShiftsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProviderShift[]> {
    const raws = await this.db.providerShift.findMany({
      where: {
        providerId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    return raws.map((shift) => new ProviderShift(shift));
  }
}
