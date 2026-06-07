import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IInvoiceCommandRepository } from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { CreateInvoiceProps } from '@modules/finance/invoice/domain/types/create-invoice.props';

@Injectable()
export class InvoiceCommandRepository
  extends BaseRepository
  implements IInvoiceCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(props: CreateInvoiceProps): Promise<Invoice> {
    return this.db.invoice.create({
      data: {
        id: props.id,
        clinicId: props.clinicId,
        patientId: props.patientId,
        appointmentId: props.appointmentId,
        paymentId: props.paymentId,
        amount: props.amount,
        currency: props.currency,
        status: props.status,
        invoiceNumber: props.invoiceNumber,
        issuedAt: props.issuedAt,
        providerRef: props.providerRef,
        rawResponse: props.rawResponse ?? undefined,
      },
    });
  }

  markAsIssued(props: {
    invoiceId: string;
    invoiceNumber: string;
    providerRef: string;
    issuedAt: Date;
    rawResponse?: unknown;
  }): Promise<Invoice> {
    return this.db.invoice.update({
      where: { id: props.invoiceId },
      data: {
        status: InvoiceStatus.ISSUED,
        invoiceNumber: props.invoiceNumber,
        providerRef: props.providerRef,
        issuedAt: props.issuedAt,
        rawResponse: props.rawResponse ?? undefined,
      },
    });
  }

  markAsFailed(invoiceId: string): Promise<Invoice> {
    return this.db.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.FAILED },
    });
  }
}
