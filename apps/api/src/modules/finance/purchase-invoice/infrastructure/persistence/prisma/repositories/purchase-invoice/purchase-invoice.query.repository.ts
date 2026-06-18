import { Injectable } from '@nestjs/common';
import { Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IPurchaseInvoiceQueryRepository } from '@modules/finance/purchase-invoice/domain/repositories/purchase-invoice.repository';
import { PurchaseInvoice } from '@modules/finance/purchase-invoice/domain/entities/purchase-invoice.entity';

@Injectable()
export class PurchaseInvoiceQueryRepository
  extends BaseRepository
  implements IPurchaseInvoiceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<PurchaseInvoice | null> {
    const raw = await this.db.purchaseInvoice.findUnique({ where: { id } });
    return raw ? new PurchaseInvoice(raw) : null;
  }

  async findManyByClinic(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: PurchaseInvoice[]; total: number }> {
    const result = await paginate({
      delegate: this.db.purchaseInvoice,
      pagination,
      where: { clinicId },
    });

    return {
      items: result.items.map((raw) => new PurchaseInvoice(raw)),
      total: result.total,
    };
  }
}
