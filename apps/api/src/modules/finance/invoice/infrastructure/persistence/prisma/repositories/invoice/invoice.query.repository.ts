import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IInvoiceQueryRepository } from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Pagination } from '@shared';
import { FindInvoicesFilter } from '@modules/finance/invoice/domain/invoice.contracts';

@Injectable()
export class InvoiceQueryRepository
  extends BaseRepository
  implements IInvoiceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Invoice | null> {
    const raw = await this.db.invoice.findUnique({ where: { id, isDeleted: false } });
    return raw ? new Invoice(raw) : null;
  }

  async findByAppointmentId(appointmentId: string): Promise<Invoice | null> {
    const raw = await this.db.invoice.findFirst({
      where: { appointmentId, isDeleted: false },
    });
    return raw ? new Invoice(raw) : null;
  }

  async findByPaymentId(paymentId: string): Promise<Invoice | null> {
    const raw = await this.db.invoice.findFirst({
      where: { paymentId, isDeleted: false },
    });
    return raw ? new Invoice(raw) : null;
  }

  async findMany(
    filter: FindInvoicesFilter,
    pagination: Pagination
  ): Promise<{ items: Invoice[]; total: number }> {
    const result = await paginate({
      delegate: this.db.invoice,
      pagination,
      where: {
        organizationId: filter.organizationId,
        isDeleted: false,
        ...(filter.clinicId ? { clinicId: filter.clinicId } : {}),
      },
    });
    return {
      items: result.items.map((r) => new Invoice(r)),
      total: result.total,
    };
  }
}
