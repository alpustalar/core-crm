import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IInvoiceQueryRepository,
  INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { GetInvoiceByIdQuery } from './get-invoice-by-id.query';
import { GetInvoiceByIdResponse } from './get-invoice-by-id.response';

@QueryHandler(GetInvoiceByIdQuery)
export class GetInvoiceByIdHandler
  implements IQueryHandler<GetInvoiceByIdQuery, GetInvoiceByIdResponse>
{
  constructor(
    @Inject(INVOICE_QUERY_REPOSITORY)
    private readonly invoiceQueryRepo: IInvoiceQueryRepository
  ) {}

  async execute(query: GetInvoiceByIdQuery): Promise<GetInvoiceByIdResponse> {
    const invoice = await this.invoiceQueryRepo.findById(query.invoiceId);
    if (!invoice) return { data: null };

    const tax = invoice.taxSpecification;
    return {
      data: {
        id: invoice.id.value,
        clinicId: invoice.clinicId.value,
        patientId: invoice.patientId.value,
        netTotal: tax.netAmount.amount.toFixed(2),
        vatTotal: tax.taxAmount.amount.toFixed(2),
        grandTotal: tax.grossAmount.amount.toFixed(2),
        vatRate: invoice.vatRate.value,
        currency: invoice.currency.value,
        issuedAt: invoice.issuedAt,
        status: invoice.status,
      },
    };
  }
}
