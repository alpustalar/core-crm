import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPurchaseInvoiceCommandRepository } from '@modules/finance/purchase-invoice/domain/repositories/purchase-invoice.repository';
import { PurchaseInvoice } from '@modules/finance/purchase-invoice/domain/entities/purchase-invoice.entity';

@Injectable()
export class PurchaseInvoiceCommandRepository
  extends BaseRepository
  implements IPurchaseInvoiceCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(entity: PurchaseInvoice): Promise<PurchaseInvoice> {
    const data = entity.toPersistence();
    const raw = await this.db.purchaseInvoice.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
    entity.flushEvents();
    return new PurchaseInvoice(raw);
  }
}
