import { Injectable } from '@nestjs/common';
import { Invoice as IInvoice, Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { FindInvoicesFilter } from '@modules/finance/invoice/domain/contracts/invoice';
import { IInvoiceQueryRepository } from '@modules/finance/invoice/domain/repositories/invoice/invoice.query.repository';

/**
 * Okuma tarafı: entity hidrate edilmez. Mükerrer fatura kontrolü ve e-Belge sonucu
 * işleme gibi yazma kararını besleyen okumalar Command Repo'dadır.
 */
@Injectable()
export class InvoiceQueryRepository
  extends BaseRepository
  implements IInvoiceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<IInvoice | null> {
    return this.db.invoice.findUnique({ where: { id, isDeleted: false } });
  }

  findByPaymentId(paymentId: string): Promise<IInvoice | null> {
    return this.db.invoice.findFirst({
      where: { paymentId, isDeleted: false },
    });
  }

  findByAppointmentId(appointmentId: string): Promise<IInvoice | null> {
    return this.db.invoice.findFirst({
      where: { appointmentId, isDeleted: false },
    });
  }

  findMany(
    filter: FindInvoicesFilter,
    pagination: Pagination
  ): Promise<{ items: IInvoice[]; total: number }> {
    return paginate({
      delegate: this.db.invoice,
      pagination,
      where: {
        organizationId: filter.organizationId,
        isDeleted: false,
        ...(filter.clinicId ? { clinicId: filter.clinicId } : {}),
      },
    });
  }
}
