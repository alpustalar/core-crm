import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPurchaseRequestCommandRepository } from '@modules/supply/purchasing/domain/repositories/purchase-request.repository';
import {
  PurchaseRequest,
  PurchaseRequestLine,
} from '@modules/supply/purchasing/domain/entities/purchase-request.entity';
import { PurchaseRequest as IPurchaseRequest } from '@model-schema/PurchaseRequestSchema';

type RawItem = {
  id: string;
  productId: string | null;
  description: string;
  quantity: Decimal;
  estimatedUnitPrice: Decimal | null;
  unit: string | null;
};

@Injectable()
export class PurchaseRequestCommandRepository
  extends BaseCommandRepository<PurchaseRequest>
  implements IPurchaseRequestCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: PurchaseRequest): Promise<PurchaseRequest> {
    const header = entity.toPersistence();
    const raw = await this.db.purchaseRequest.create({
      data: {
        ...header,
        items: {
          create: entity.lines.map((line) => ({
            id: line.id,
            productId: line.productId,
            description: line.description,
            quantity: line.quantity,
            estimatedUnitPrice: line.estimatedUnitPrice,
            unit: line.unit,
          })),
        },
      },
      include: { items: true },
    });
    entity.flushEvents();
    return this.toEntity(raw);
  }

  async update(entity: PurchaseRequest): Promise<PurchaseRequest> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.purchaseRequest.update({
      where: { id },
      data: update,
      include: { items: true },
    });
    entity.flushEvents();
    return this.toEntity(raw);
  }

  async findById(id: string): Promise<PurchaseRequest | null> {
    const raw = await this.db.purchaseRequest.findUnique({
      where: { id },
      include: { items: true },
    });
    return raw ? this.toEntity(raw) : null;
  }

  private toEntity(
    raw: IPurchaseRequest & { items: RawItem[] }
  ): PurchaseRequest {
    const { items, ...header } = raw;
    const lines: PurchaseRequestLine[] = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      description: item.description,
      quantity: new Decimal(item.quantity.toString()),
      estimatedUnitPrice:
        item.estimatedUnitPrice !== null
          ? new Decimal(item.estimatedUnitPrice.toString())
          : null,
      unit: item.unit,
    }));
    return new PurchaseRequest(header, lines);
  }
}
