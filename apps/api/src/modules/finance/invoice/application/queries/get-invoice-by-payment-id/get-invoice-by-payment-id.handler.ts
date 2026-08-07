import { Decimal } from 'decimal.js';
import { taxSpecificationOf } from '@modules/finance/invoice/domain/rules/invoice-tax';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IInvoiceQueryRepository,
  INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { GetInvoiceByPaymentIdQuery } from './get-invoice-by-payment-id.query';
import { GetInvoiceByPaymentIdResponse } from './get-invoice-by-payment-id.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetInvoiceByPaymentIdQuery)
export class GetInvoiceByPaymentIdHandler
  implements
    IQueryHandler<GetInvoiceByPaymentIdQuery, GetInvoiceByPaymentIdResponse>
{
  constructor(
    @Inject(INVOICE_QUERY_REPOSITORY)
    private readonly invoiceQueryRepo: IInvoiceQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetInvoiceByPaymentIdQuery
  ): Promise<GetInvoiceByPaymentIdResponse> {
    const { ctx } = query;
    const invoice = await this.invoiceQueryRepo.findByPaymentId(
      query.paymentId
    );
    if (!invoice) return { data: null };

    // TODO: policy

    const tax = taxSpecificationOf(invoice);
    return {
      data: {
        id: invoice.id,
        organizationId: invoice.organizationId,
        clinicId: invoice.clinicId,
        patientId: invoice.patientId,
        netTotal: tax.netAmount.value.toFixed(2),
        vatTotal: tax.taxAmount.value.toFixed(2),
        grandTotal: tax.grossAmount.value.toFixed(2),
        vatRate: new Decimal(invoice.vatRate),
        currency: invoice.currency,
        issuedAt: invoice.issuedAt,
        status: invoice.status,
      },
    };
  }
}
