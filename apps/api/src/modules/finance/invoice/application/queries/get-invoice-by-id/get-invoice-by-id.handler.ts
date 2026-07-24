import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IInvoiceQueryRepository,
  INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { GetInvoiceByIdQuery } from './get-invoice-by-id.query';
import { GetInvoiceByIdResponse } from './get-invoice-by-id.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetInvoiceByIdQuery)
export class GetInvoiceByIdHandler
  implements IQueryHandler<GetInvoiceByIdQuery, GetInvoiceByIdResponse>
{
  constructor(
    @Inject(INVOICE_QUERY_REPOSITORY)
    private readonly invoiceQueryRepo: IInvoiceQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetInvoiceByIdQuery): Promise<GetInvoiceByIdResponse> {
    const { ctx } = query;
    const invoice = await this.invoiceQueryRepo.findById(query.invoiceId);
    if (!invoice) return { data: null };

    // TODO: policy

    const tax = invoice.taxSpecification;
    return {
      data: {
        id: invoice.id.value,
        organizationId: invoice.organizationId.value,
        clinicId: invoice.clinicId.value,
        patientId: invoice.patientId.value,
        netTotal: tax.netAmount.value.toFixed(2),
        vatTotal: tax.taxAmount.value.toFixed(2),
        grandTotal: tax.grossAmount.value.toFixed(2),
        vatRate: invoice.vatRate.value,
        currency: invoice.currency.value,
        issuedAt: invoice.issuedAt,
        status: invoice.status,
      },
    };
  }
}
