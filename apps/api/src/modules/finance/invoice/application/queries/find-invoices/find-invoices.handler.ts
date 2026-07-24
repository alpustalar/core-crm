import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindInvoicesQuery } from './find-invoices.query';
import { FindInvoicesResponse } from './find-invoices.response';
import {
  IInvoiceQueryRepository,
  INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';
import { InvoiceListItem } from '@modules/finance/invoice/domain/invoice.contracts';

@QueryHandler(FindInvoicesQuery)
export class FindInvoicesHandler
  implements IQueryHandler<FindInvoicesQuery, FindInvoicesResponse>
{
  constructor(
    @Inject(INVOICE_QUERY_REPOSITORY)
    private readonly invoiceQueryRepo: IInvoiceQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: FindInvoicesQuery): Promise<FindInvoicesResponse> {
    const { pagination, ctx, clinicId, organizationId } = query.payload;

    // Tenant sınırı: yalnız kendi organizasyonunun faturaları.
    this.policyFactory
      .organization(ctx.actor, ctx.source)
      .evaluator.check(
        (p) => p.actorCanManageTargetOrganization(organizationId),
        'Fatura listeleme yetkiniz yok.'
      )
      .orThrow();

    // Klinik daraltması istenmişse aktörün o kliniğe erişimi olmalı (sistem çağrıları bypass).
    if (clinicId) {
      this.policyFactory
        .clinic(ctx.actor, ctx.source)
        .evaluator.check((p) => p.actorCanAccessTargetClinic(clinicId))
        .orThrow();
    }

    const result = await this.invoiceQueryRepo.findMany(
      { organizationId, clinicId },
      pagination
    );

    return {
      data: result.items.map((invoice) => this.toListItem(invoice)),
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
      },
    };
  }

  private toListItem(invoice: Invoice): InvoiceListItem {
    return {
      id: invoice.id.value,
      organizationId: invoice.organizationId.value,
      clinicId: invoice.clinicId.value,
      patientId: invoice.patientId.value,
      grandTotal: invoice.taxSpecification.grossAmount.value.toFixed(2),
      currency: invoice.currency.value,
      status: invoice.status,
      invoiceNumber: invoice.invoiceNumber?.value ?? null,
      issuedAt: invoice.issuedAt,
      createdAt: invoice.createdAt,
    };
  }
}
