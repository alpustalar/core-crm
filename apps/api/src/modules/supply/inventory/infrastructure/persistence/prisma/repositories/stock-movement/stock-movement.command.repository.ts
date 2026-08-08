import { StockMovement } from '@modules/supply/inventory/domain/entities/stock-movement.entity';
import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IStockMovementCommandRepository } from '@modules/supply/inventory/domain/repositories/stock-movement/stock-movement.command.repository';

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

  async create(entity: StockMovement): Promise<StockMovement> {
    const data = entity.toPersistence();
    const raw = await this.db.stockMovement.create({ data });
    entity.flushEvents();
    return new StockMovement(raw);
  }

  async update(entity: StockMovement): Promise<StockMovement> {
    const data = entity.toPersistence();
    const raw = await this.db.stockMovement.update({
      where: { id: data.id },
      data,
    });
    entity.flushEvents();
    return new StockMovement(raw);
  }
}
