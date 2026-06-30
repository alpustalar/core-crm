import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { IssueInvoiceCommand } from './issue-invoice.command';
import { IssueInvoiceResponse } from './issue-invoice.response';
import {
  IInvoiceCommandRepository,
  IInvoiceQueryRepository,
  INVOICE_COMMAND_REPOSITORY,
  INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { IGetContext } from '@common/decorators';
import {
  GetTaxRateQuery
} from '@modules/finance/accounting/tax-parameters/application/queries/get-tax-rate/get-tax-rate.query';
import {
  GetClinicGovernmentSpecsQuery
} from '@modules/organization/clinic-governance/application/queries/get-clinic-government-specs/get-clinic-government-specs.query';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import {
  EnsurePartyForPatientCommand
} from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import {
  RecordFinancialEventCommand
} from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import {
  QueueEDocumentCommand
} from '@modules/finance/e-document/application/commands/queue-e-document/queue-e-document.command';
import { TaxSpecification } from '@modules/finance/shared/domain/value-objects/tax-specification.vo';
import { FinancialEventTypeSchema, PartyRoleSchema, PartyTypeSchema, TaxParameterKeySchema, } from '@shared';
import { PartyTypeType as PartyType } from '@input-type-schemas/PartyTypeSchema';
import { InvoiceStatusSchema } from '@input-type-schemas/InvoiceStatusSchema';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Currency } from '@src/domain/value-objects/currency.vo';

@CommandHandler(IssueInvoiceCommand)
export class IssueInvoiceHandler
  implements ICommandHandler<IssueInvoiceCommand, IssueInvoiceResponse>
{
  private readonly logger = new Logger(IssueInvoiceHandler.name);

  constructor(
    @Inject(INVOICE_COMMAND_REPOSITORY)
    private readonly invoiceCommandRepo: IInvoiceCommandRepository,
    @Inject(INVOICE_QUERY_REPOSITORY)
    private readonly invoiceQueryRepo: IInvoiceQueryRepository,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: IssueInvoiceCommand): Promise<IssueInvoiceResponse> {
    const { input } = command;

    const existingInvoice = await this.resolveExisting(input);
    if (existingInvoice) {
      this.logger.log(
        `Fatura zaten mevcut, atlanıyor. invoiceId=${existingInvoice.id.value}`
      );
      return {
        invoiceId: existingInvoice.id.value,
        invoiceNumber: existingInvoice.invoiceNumber,
        status: existingInvoice.status,
      };
    }

    const invoiceId = UUID.generate().value;
    // KDV oranı parametriktir: açıkça verilmemişse şubenin geçerli sağlık KDV'sini çöz.
    const vatRate =
      input.vatRate ?? (await this.resolveVatRate(input.clinicId));
    const taxSpec = TaxSpecification.fromGrossAmount(
      input.totalAmount,
      vatRate
    );

    // Fatura PENDING oluşturulur ve ekonomik olay (SALES_INVOICE_ISSUED) HER ZAMAN
    // yazılır — e-belge gönderiminden bağımsız (doc 07 §5). İkisi atomik (outboxRun).
    await this.txManager.outboxRun(async () => {
      await this.invoiceCommandRepo.create({
        id: invoiceId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        paymentId: input.paymentId,
        amount: input.totalAmount.amount.toNumber(),
        currency:
          input.totalAmount.currency ?? Currency.generate(Currency.enum.TRY),
        vatRate,
        netTotal: taxSpec.netAmount.amount,
        vatTotal: taxSpec.taxAmount.amount,
        status: InvoiceStatusSchema.enum.PENDING,
      });

      await this.recordSalesInvoiceIssued({
        invoiceId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        netTotal: taxSpec.netAmount.amount.toString(),
        vatTotal: taxSpec.taxAmount.amount.toString(),
        grandTotal: taxSpec.grossAmount.amount.toString(),
        issuedAt: new Date(),
      });
    });

    // e-Belge gönderimi async kuyruğa düşer (doc 07 §5); fatura/muhasebe zaten commit
    // edildiği için enqueue hatası akışı geri almaz — yalnız loglanır. Processor portu
    // çağırıp sonucu (Noop → INTERNAL) faturaya işler, fatura ISSUED'a finalize olur.
    await this.enqueueEDocument(invoiceId);

    return {
      invoiceId,
      invoiceNumber: null,
      status: InvoiceStatusSchema.enum.PENDING,
    };
  }

  /** e-Belge gönderimini kuyruğa alır; entegratör akışı faturayı bloklamaz. */
  private async enqueueEDocument(invoiceId: string): Promise<void> {
    try {
      await this.commandBus.execute(new QueueEDocumentCommand(invoiceId));
    } catch (error) {
      this.logger.error(
        `e-Belge kuyruğa alınamadı: invoiceId=${invoiceId}`,
        error
      );
    }
  }

  /** Şubenin bugün geçerli sağlık hizmeti KDV oranını parametrik tablodan çözer. */
  private async resolveVatRate(clinicId: string): Promise<number> {
    const { data } = await this.queryBus.execute(
      new GetTaxRateQuery(
        clinicId,
        TaxParameterKeySchema.enum.VAT_HEALTH,
        new Date()
      )
    );
    return data.rate;
  }

  private async resolveExisting(input: IssueInvoiceCommand['input']) {
    if (input.appointmentId) {
      return this.invoiceQueryRepo.findByAppointmentId(input.appointmentId);
    }
    if (input.paymentId) {
      return this.invoiceQueryRepo.findByPaymentId(input.paymentId);
    }
    return null;
  }

  /**
   * Faturayı muhasebe katmanına köprüler: hastanın carisini garanti eder ve
   * SALES_INVOICE_ISSUED ekonomik olayını yazar. dedupeKey ile idempotenttir;
   * olay Outbox'a düşer, posting listener'ı fişi (120 / 600.xx + 391) üretir.
   */
  private async recordSalesInvoiceIssued(
    input: RecordSalesInvoiceIssuedInput
  ): Promise<void> {
    const ctx = ExecutionContextFactory.createInternal();

    try {
      const { partyId, organizationId } = await this.commandBus.execute(
        new EnsurePartyForPatientCommand(
          input.patientId,
          input.clinicId,
          PartyRoleSchema.enum.CUSTOMER,
          ctx
        )
      );

      // Hasta cari = nihai tüketici (INDIVIDUAL). SMM stopajı yalnız ödeyen vergi
      // sorumlusu (COMPANY) ise yapılır (doc 05 §2.1, 06 §3); helper INDIVIDUAL'da
      // erken çıkar (ekstra sorgu yok). Kurumsal-ödeyen faturalama gelince aktifleşir.
      const withholdingTotal = await this.resolveSmmWithholding({
        clinicId: input.clinicId,
        payerType: PartyTypeSchema.enum.INDIVIDUAL,
        netTotal: input.netTotal,
        ctx,
      });

      // TODO: dedupe key ve source modeli enum oluşturup öyle kullan
      await this.commandBus.execute(
        new RecordFinancialEventCommand(
          {
            organizationId,
            clinicId: input.clinicId,
            type: FinancialEventTypeSchema.enum.SALES_INVOICE_ISSUED,
            occurredAt: input.issuedAt,
            payload: {
              partyId,
              netTotal: input.netTotal,
              vatTotal: input.vatTotal,
              grandTotal: input.grandTotal,
              ...(withholdingTotal ? { withholdingTotal } : {}),
            },
            sourceModule: 'invoice',
            sourceRefId: input.invoiceId,
            dedupeKey: `sales-invoice:${input.invoiceId}`,
          },
          ctx
        )
      );
    } catch (error) {
      // Köprü hatası fatura kesimini bozmamalı; olay sonradan yeniden üretilebilir.
      this.logger.error(
        `Muhasebe köprüsü başarısız: invoiceId=${input.invoiceId}`,
        error
      );
    }
  }

  /**
   * SMM (serbest meslek) gelir vergisi stopajını çözer. Yalnız ödeyen vergi
   * sorumlusu (COMPANY) + klinik SERBEST_MESLEK ise stopaj = net × WHT oranı.
   * INDIVIDUAL ödeyen (nihai tüketici) erken çıkar — governance/vergi sorgusu yapılmaz.
   */
  private async resolveSmmWithholding(
    input: ResolveSmmWithholdingInput
  ): Promise<string | undefined> {
    if (input.payerType !== PartyTypeSchema.enum.COMPANY) return undefined;

    const { data: specs } = await this.queryBus.execute(
      new GetClinicGovernmentSpecsQuery(input.clinicId, input.ctx)
    );
    if (specs?.legalType !== 'SERBEST_MESLEK') return undefined;

    const { data: wht } = await this.queryBus.execute(
      new GetTaxRateQuery(
        input.clinicId,
        TaxParameterKeySchema.enum.WHT_SELF_EMPLOYMENT,
        new Date()
      )
    );

    return new Decimal(input.netTotal).mul(wht.rate).div(100).toFixed(2);
  }
}

interface RecordSalesInvoiceIssuedInput {
  invoiceId: string;
  clinicId: string;
  patientId: string;
  netTotal: string;
  vatTotal: string;
  grandTotal: string;
  issuedAt: Date;
}

interface ResolveSmmWithholdingInput {
  clinicId: string;
  payerType: PartyType;
  netTotal: string;
  ctx: IGetContext;
}
