import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';
import { IStockMovementCommandRepository } from '@modules/supply/inventory/domain/repositories/stock-movement.repository.interface';
import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class StockMovementCommandRepository
  extends BaseCommandRepository<StockMovement>
  implements IStockMovementCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(entity: StockMovement): Promise<StockMovement> {
    const data = entity.toPersistence();
    const raw = await this.db.stockMovement.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
    entity.flushEvents();
    return new StockMovement(raw);
  }

  async saveMany(entities: StockMovement[]): Promise<void> {
    const queries = entities.map((entity) => {
      const data = entity.toPersistence();
      return this.db.stockMovement.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(queries);
    } else {
      await this.prisma.$transaction(queries);
    }

    entities.forEach((e) => e.flushEvents());
  }
}
