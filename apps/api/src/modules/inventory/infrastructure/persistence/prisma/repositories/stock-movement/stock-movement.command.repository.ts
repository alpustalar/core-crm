import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IStockMovementCommandRepository } from '@modules/inventory/domain/repositories/stock-movement.repository.interface';
import { StockMovement } from '@modules/inventory/domain/entities/stock-movement.entity';
import { CreateStockMovementProps } from '@modules/inventory/domain/types/create-stock-movement.props';

@Injectable()
export class StockMovementCommandRepository extends BaseRepository implements IStockMovementCommandRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateStockMovementProps): Promise<StockMovement> {
    const raw = await this.db.stockMovement.create({
      data: {
        id: props.id,
        productId: props.productId,
        clinicId: props.clinicId,
        batchId: props.batchId ?? null,
        type: props.type,
        direction: props.direction,
        quantity: props.quantity,
        unitPrice: props.unitPrice ?? null,
        currency: props.currency ?? 'TRY',
        vatRate: props.vatRate ?? null,
        vatAmount: props.vatAmount ?? null,
        totalAmount: props.totalAmount ?? null,
        performedById: props.performedById ?? null,
        notes: props.notes ?? null,
      },
    });
    return new StockMovement(raw);
  }
}
