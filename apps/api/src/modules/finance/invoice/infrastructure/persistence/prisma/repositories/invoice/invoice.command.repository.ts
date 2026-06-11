import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IInvoiceCommandRepository } from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { CreateInvoiceProps } from '@modules/finance/invoice/domain/types/create-invoice.props';
import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';

@Injectable()
export class InvoiceCommandRepository
  extends BaseRepository
  implements IInvoiceCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(props: CreateInvoiceProps): Promise<Invoice> {
    const raw = await this.db.invoice.create({
      data: {
        id: props.id,
        clinicId: props.clinicId,
        patientId: props.patientId,
        appointmentId: props.appointmentId,
        paymentId: props.paymentId,
        amount: props.amount,
        currency: props.currency,
        vatRate: props.vatRate,
        netTotal: props.netTotal,
        vatTotal: props.vatTotal,
        status: props.status,
        invoiceNumber: props.invoiceNumber,
        issuedAt: props.issuedAt,
        providerRef: props.providerRef,
        rawResponse: props.rawResponse ?? undefined,
      },
    });
    return new Invoice(raw);
  }

  async save(entity: Invoice): Promise<Invoice> {
    const data = entity.toPersistence();
    const raw = await this.db.invoice.update({
      where: { id: data.id },
      data: {
        status: data.status,
        invoiceNumber: data.invoiceNumber,
        issuedAt: data.issuedAt,
        providerRef: data.providerRef,
        rawResponse: data.rawResponse ?? undefined,
        updatedAt: data.updatedAt,
      },
    });
    entity.flushEvents();
    return new Invoice(raw);
  }
}
