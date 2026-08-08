import { Injectable } from '@nestjs/common';
import { Pagination, PurchaseInvoice as IPurchaseInvoice } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IPurchaseInvoiceQueryRepository } from '@modules/finance/purchase-invoice/domain/repositories/purchase-invoice.repository';

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
@Injectable()
export class PurchaseInvoiceQueryRepository
  extends BaseRepository
  implements IPurchaseInvoiceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findManyByClinic(
    clinicId: string,
    pagination: Pagination
  ): Promise<{ items: IPurchaseInvoice[]; total: number }> {
    return paginate({
      delegate: this.db.purchaseInvoice,
      pagination,
      where: { clinicId },
    });
  }
}
