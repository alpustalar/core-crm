import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';
import { IStockMovementCommandRepository } from '@modules/supply/inventory/domain/repositories/stock-movement.repository.interface';
import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class StockMovementCommandRepository
  extends BaseCommandRepository<StockMovement>
  implements IStockMovementCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<StockMovement | null> {
    const raw = await this.db.stockMovement.findUnique({ where: { id } });
    return raw ? new StockMovement(raw) : null;
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
}
