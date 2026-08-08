import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPurchaseInvoiceCommandRepository } from '@modules/finance/purchase-invoice/domain/repositories/purchase-invoice.repository';
import { PurchaseInvoice } from '@modules/finance/purchase-invoice/domain/entities/purchase-invoice.entity';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';

@Injectable()
export class PurchaseInvoiceCommandRepository
  extends BaseCommandRepository<PurchaseInvoice>
  implements IPurchaseInvoiceCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<PurchaseInvoice | null> {
    const raw = await this.db.purchaseInvoice.findUnique({ where: { id } });
    return raw ? new PurchaseInvoice(raw) : null;
  }

  async update(entity: PurchaseInvoice): Promise<PurchaseInvoice> {
    const persistenceData = entity.toPersistence();
    const { id, ...data } = persistenceData;

    const raw = await this.db.purchaseInvoice.update({
      where: { id },
      data,
    });
    entity.flushEvents();
    return new PurchaseInvoice(raw);
  }

  async create(entity: PurchaseInvoice): Promise<PurchaseInvoice> {
    const data = entity.toPersistence();
    const raw = await this.db.purchaseInvoice.create({
      data,
    });
    entity.flushEvents();
    return new PurchaseInvoice(raw);
  }

  async sync(entity: PurchaseInvoice): Promise<PurchaseInvoice> {
    const create = entity.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.purchaseInvoice.upsert({
      where: { id },
      create,
      update,
    });
    entity.flushEvents();
    return new PurchaseInvoice(raw);
  }
}
