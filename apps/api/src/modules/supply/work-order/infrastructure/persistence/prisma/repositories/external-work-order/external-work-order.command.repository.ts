import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { Prisma } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IExternalWorkOrderCommandRepository } from '@modules/supply/work-order/domain/repositories/external-work/external-work-order.command.repository';
import {
  ExternalWorkOrder,
  WorkOrderLine,
} from '@modules/supply/work-order/domain/entities/external-work-order.entity';
import { ExternalWorkOrder as IExternalWorkOrder } from '@model-schema/ExternalWorkOrderSchema';
import { ExternalWorkOrderStatusSchema } from '@input-type-schemas/ExternalWorkOrderStatusSchema';
import type { WorkOrderItemSpecs } from '@shared/modules/work-order/schemas';

type RawWorkOrderItem = {
  id: string;
  description: string;
  quantity: Prisma.Decimal;
  unitCost: Prisma.Decimal | null;
  specs: Prisma.JsonValue | null;
};

@Injectable()
export class ExternalWorkOrderCommandRepository
  extends BaseCommandRepository<ExternalWorkOrder>
  implements IExternalWorkOrderCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: ExternalWorkOrder): Promise<ExternalWorkOrder> {
    const header = entity.toPersistence();
    const raw = await this.db.externalWorkOrder.create({
      data: {
        ...header,
        items: {
          create: entity.lines.map((line) => ({
            id: line.id,
            description: line.description,
            quantity: line.quantity,
            unitCost: line.unitCost,
            specs: line.specs ?? Prisma.DbNull,
          })),
        },
      },
      include: { items: true },
    });
    entity.flushEvents();
    return this.toEntity(raw);
  }

  /** Başlık durumunu günceller — satırlar iş emri açıldıktan sonra değişmez. */
  async update(entity: ExternalWorkOrder): Promise<ExternalWorkOrder> {
    const { id, ...update } = entity.toPersistence();
    const raw = await this.db.externalWorkOrder.update({
      where: { id },
      data: update,
      include: { items: true },
    });
    entity.flushEvents();
    return this.toEntity(raw);
  }

  async findById(id: string): Promise<ExternalWorkOrder | null> {
    const raw = await this.db.externalWorkOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    return raw ? this.toEntity(raw) : null;
  }

  async findOverdueForNotification(
    now: Date,
    limit: number
  ): Promise<ExternalWorkOrder[]> {
    const rows = await this.db.externalWorkOrder.findMany({
      where: {
        dueDate: { lt: now },
        overdueNotifiedAt: null,
        status: {
          in: [
            ExternalWorkOrderStatusSchema.enum.SENT,
            ExternalWorkOrderStatusSchema.enum.IN_PROGRESS,
            ExternalWorkOrderStatusSchema.enum.TRY_IN,
            ExternalWorkOrderStatusSchema.enum.READY,
          ],
        },
      },
      include: { items: true },
      orderBy: { dueDate: 'asc' },
      take: limit,
    });

    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(
    raw: IExternalWorkOrder & { items: RawWorkOrderItem[] }
  ): ExternalWorkOrder {
    const { items, ...header } = raw;
    const lines: WorkOrderLine[] = items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: new Decimal(item.quantity.toString()),
      unitCost: item.unitCost ? new Decimal(item.unitCost.toString()) : null,
      specs: (item.specs as WorkOrderItemSpecs | null) ?? null,
    }));
    return new ExternalWorkOrder(header, lines);
  }
}
