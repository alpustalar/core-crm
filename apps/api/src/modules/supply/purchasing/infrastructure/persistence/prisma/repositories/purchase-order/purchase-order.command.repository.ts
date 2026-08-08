import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPurchaseOrderCommandRepository } from '@modules/supply/purchasing/domain/repositories/purchase-order.repository';
import {
  PurchaseOrder,
  PurchaseOrderLine,
} from '@modules/supply/purchasing/domain/entities/purchase-order.entity';
import { PurchaseOrder as IPurchaseOrder } from '@model-schema/PurchaseOrderSchema';

type RawOrderItem = {
  id: string;
  productId: string | null;
  description: string;
  quantityOrdered: Decimal;
  quantityReceived: Decimal;
  unitPrice: Decimal;
  vatRate: number;
  lineNet: Decimal;
  lineVat: Decimal;
  lineTotal: Decimal;
};

@Injectable()
export class PurchaseOrderCommandRepository
  extends BaseCommandRepository<PurchaseOrder>
  implements IPurchaseOrderCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: PurchaseOrder): Promise<PurchaseOrder> {
    const header = entity.toPersistence();
    const raw = await this.db.purchaseOrder.create({
      data: {
        ...header,
        items: {
          create: entity.lines.map((line) => ({
            id: line.id,
            productId: line.productId,
            description: line.description,
            quantityOrdered: line.quantityOrdered,
            quantityReceived: line.quantityReceived,
            unitPrice: line.unitPrice,
            vatRate: line.vatRate,
            lineNet: line.lineNet,
            lineVat: line.lineVat,
            lineTotal: line.lineTotal,
          })),
        },
      },
      include: { items: true },
    });
    entity.flushEvents();
    return this.toEntity(raw);
  }

  /** Başlık durumunu + kalemlerin teslim alınan miktarını günceller (mal kabul). */
  async update(entity: PurchaseOrder): Promise<PurchaseOrder> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.purchaseOrder.update({
      where: { id },
      data: {
        ...update,
        items: {
          update: entity.lines.map((line) => ({
            where: { id: line.id },
            data: { quantityReceived: line.quantityReceived },
          })),
        },
      },
      include: { items: true },
    });
    entity.flushEvents();
    return this.toEntity(raw);
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    const raw = await this.db.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    return raw ? this.toEntity(raw) : null;
  }

  private toEntity(
    raw: IPurchaseOrder & { items: RawOrderItem[] }
  ): PurchaseOrder {
    const { items, ...header } = raw;
    const lines: PurchaseOrderLine[] = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      description: item.description,
      quantityOrdered: new Decimal(item.quantityOrdered.toString()),
      quantityReceived: new Decimal(item.quantityReceived.toString()),
      unitPrice: new Decimal(item.unitPrice.toString()),
      vatRate: item.vatRate,
      lineNet: new Decimal(item.lineNet.toString()),
      lineVat: new Decimal(item.lineVat.toString()),
      lineTotal: new Decimal(item.lineTotal.toString()),
    }));
    return new PurchaseOrder(header, lines);
  }
}
