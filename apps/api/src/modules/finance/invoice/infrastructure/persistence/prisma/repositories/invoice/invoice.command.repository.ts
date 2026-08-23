import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { CreateInvoiceProps } from '@modules/finance/invoice/domain/contracts/invoice.contracts';
import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';
import { IInvoiceCommandRepository } from '@modules/finance/invoice/domain/repositories/invoice/invoice.command.repository';
import { InvoiceDuplicateException } from '@modules/finance/invoice/domain/exceptions/invoice.exceptions';

@Injectable()
export class InvoiceCommandRepository
  extends BaseRepository
  implements IInvoiceCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Invoice | null> {
    const raw = await this.db.invoice.findUnique({
      where: { id, isDeleted: false },
    });
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

  /**
   * Mükerrer faturayı nihai olarak DB kısıtı engeller (`appointment_id` /
   * `payment_id` unique): "önce sorgula, yoksa oluştur" kontrolü ile yazma
   * arasındaki pencerede ikinci istek gelirse burada P2002 alınır. Yarışı
   * kaybeden taraf bunu tipli bir domain hatasına çevirip yukarıda kazananın
   * faturasını okur.
   */
  async create(props: CreateInvoiceProps): Promise<Invoice> {
    try {
      return await this.insert(props);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new InvoiceDuplicateException();
      }
      throw error;
    }
  }

  private async insert(props: CreateInvoiceProps): Promise<Invoice> {
    const raw = await this.db.invoice.create({
      data: {
        id: props.id,
        organizationId: props.organizationId,
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

  async update(entity: Invoice): Promise<Invoice> {
    const data = entity.toPersistence();
    const raw = await this.db.invoice.update({
      where: { id: data.id },
      data: {
        status: data.status,
        invoiceNumber: data.invoiceNumber,
        issuedAt: data.issuedAt,
        providerRef: data.providerRef,
        documentType: data.documentType,
        einvoiceUuid: data.einvoiceUuid,
        einvoiceStatus: data.einvoiceStatus,
        rawResponse: data.rawResponse ?? undefined,
        updatedAt: data.updatedAt,
      },
    });
    entity.flushEvents();
    return new Invoice(raw);
  }
}
