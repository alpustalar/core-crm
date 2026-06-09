import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IInvoiceQueryRepository } from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';

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
}
