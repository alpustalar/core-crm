import { Injectable } from '@nestjs/common';
import { Invoice } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IInvoiceQueryRepository } from '@modules/invoice/domain/repositories/invoice.repository';

@Injectable()
export class InvoiceQueryRepository
  extends BaseRepository
  implements IInvoiceQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<Invoice | null> {
    return this.db.invoice.findUnique({ where: { id, isDeleted: false } });
  }

  findByAppointmentId(appointmentId: string): Promise<Invoice | null> {
    return this.db.invoice.findFirst({
      where: { appointmentId, isDeleted: false },
    });
  }

  findByPaymentId(paymentId: string): Promise<Invoice | null> {
    return this.db.invoice.findFirst({
      where: { paymentId, isDeleted: false },
    });
  }
}
