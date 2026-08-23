import { Inject, Injectable } from '@nestjs/common';
import {
  IInvoiceCommandRepository,
  INVOICE_COMMAND_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice/invoice.command.repository';
import { AppointmentAlreadyInvoicedException } from '@modules/finance/invoice/domain/exceptions/invoice.exceptions';
import { IInvoiceIssuanceService } from '@modules/finance/invoice/domain/services/invoice-issuance/invoice-issuance.service.interface';

@Injectable()
export class InvoiceIssuanceService implements IInvoiceIssuanceService {
  constructor(
    @Inject(INVOICE_COMMAND_REPOSITORY)
    private readonly invoiceRepo: IInvoiceCommandRepository
  ) {}

  async assertAppointmentNotInvoiced(appointmentId: string): Promise<void> {
    const invoice = await this.invoiceRepo.findByAppointmentId(appointmentId);
    if (invoice) {
      throw new AppointmentAlreadyInvoicedException(appointmentId);
    }
  }
}
