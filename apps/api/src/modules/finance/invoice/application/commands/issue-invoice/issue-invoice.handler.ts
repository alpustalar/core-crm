import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { IssueInvoiceCommand } from './issue-invoice.command';
import { IssueInvoiceResponse } from './issue-invoice.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { IGetContext } from '@common/decorators';
import { GetTaxRateQuery } from '@modules/finance/accounting/tax-parameters/application/queries/get-tax-rate/get-tax-rate.query';
import { GetClinicGovernmentSpecsQuery } from '@modules/organization/clinic-governance/application/queries/get-clinic-government-specs/get-clinic-government-specs.query';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import { QueueEDocumentCommand } from '@modules/finance/e-document/application/commands/queue-e-document/queue-e-document.command';
import { TaxSpecification } from '@modules/finance/shared/domain/value-objects/tax-specification.vo';
import {
  FinancialEventTypeSchema,
  PartyRoleSchema,
  PartyTypeSchema,
  TaxParameterKeySchema,
} from '@shared';
import { PartyTypeType as PartyType } from '@input-type-schemas/PartyTypeSchema';
import { InvoiceStatusSchema } from '@input-type-schemas/InvoiceStatusSchema';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { Money } from '@src/domain/value-objects/money.vo';
import { GetAppointmentChargeSummaryQuery } from '@modules/finance/treatment-charge/application/queries/get-appointment-charge-summary/get-appointment-charge-summary.query';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { FINANCIAL_EVENT_SOURCE_MODULES } from '@modules/finance/shared/domain/constants/financial-event-source-modules.constant';
import { FinancialEventDedupeKeys } from '@modules/finance/shared/domain/constants/financial-event-dedupe-keys.constant';
import {
  IInvoiceCommandRepository,
  INVOICE_COMMAND_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice/invoice.command.repository';

@CommandHandler(IssueInvoiceCommand)
export class IssueInvoiceHandler
  implements ICommandHandler<IssueInvoiceCommand, IssueInvoiceResponse>
{
  private readonly logger = new Logger(IssueInvoiceHandler.name);

  constructor(
    @Inject(INVOICE_COMMAND_REPOSITORY)
    private readonly invoiceRepo: IInvoiceCommandRepository,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
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
    // Fatura hem kliniğe hem organizasyona bağlıdır; org, kliniğin sahibi org'undan çözülür.
    const organizationId = await this.tenantScopeResolver.resolve({
      clinicId: input.clinicId,
    });

    // Randevunun fiyatlı işlem satırları varsa fatura ONLARDAN türer. Satırlar
    // liste fiyatı/indirim/KDV'yi zaten donmuş halde taşır; brüt tutarı yeniden
    // matraha bölmek (fromGrossAmount) kuruş sapması yaratır ve faturayı kendi
    // satırlarıyla tutarsız kılar. Satır yoksa serbest tutarlı klasik yol işler
    // (kapora, tedavi dışı tahsilat).
    const charges = await this.resolveChargeSummary(input.appointmentId);

    const vatRate =
      charges?.vatRate ??
      input.vatRate ??
      (await this.resolveVatRate(input.clinicId));

    const taxSpec = charges
      ? TaxSpecification.create(
          Money.create(charges.netTotal, input.totalAmount.currency).orThrow(),
          vatRate,
          Money.create(charges.vatTotal, input.totalAmount.currency).orThrow()
        )
      : TaxSpecification.fromGrossAmount(input.totalAmount, vatRate);

    // Fatura PENDING oluşturulur ve ekonomik olay (SALES_INVOICE_ISSUED) HER ZAMAN
    // yazılır — e-belge gönderiminden bağımsız. İkisi atomik (outboxRun).
    await this.txManager.outboxRun(async () => {
      await this.invoiceRepo.create({
        id: invoiceId,
        organizationId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        paymentId: input.paymentId,
        // Satırlardan türediyse genel toplam da satırların toplamıdır; çağıranın
        // gönderdiği tutar değil (ikisi ayrışırsa satır toplamı esastır).
        amount: taxSpec.grossAmount.value.toNumber(),
        currency:
          input.totalAmount.currency ?? Currency.fromTrusted(Currency.enum.TRY),
        vatRate,
        netTotal: taxSpec.netAmount.value,
        vatTotal: taxSpec.taxAmount.value,
        status: InvoiceStatusSchema.enum.PENDING,
      });

      await this.recordSalesInvoiceIssued({
        invoiceId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        netTotal: taxSpec.netAmount.value.toString(),
        vatTotal: taxSpec.taxAmount.value.toString(),
        grandTotal: taxSpec.grossAmount.value.toString(),
        issuedAt: DateTimeManager.create(),
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

  /**
   * Randevunun işlem satırı özeti. Satır yoksa `null` döner ve fatura serbest
   * tutarlı klasik yoldan kesilir.
   */
  private async resolveChargeSummary(appointmentId: string | null) {
    if (!appointmentId) return null;

    const { data } = await this.queryBus.execute(
      new GetAppointmentChargeSummaryQuery(appointmentId)
    );

    return data;
  }

  /** Şubenin bugün geçerli sağlık hizmeti KDV oranını parametrik tablodan çözer. */
  private async resolveVatRate(clinicId: string): Promise<number> {
    const { data } = await this.queryBus.execute(
      new GetTaxRateQuery(
        clinicId,
        TaxParameterKeySchema.enum.VAT_HEALTH,
        DateTimeManager.create()
      )
    );
    return data.rate;
  }

  private async resolveExisting(input: IssueInvoiceCommand['input']) {
    if (input.appointmentId) {
      return this.invoiceRepo.findByAppointmentId(input.appointmentId);
    }
    if (input.paymentId) {
      return this.invoiceRepo.findByPaymentId(input.paymentId);
    }
    return null;
  }

  /**
   * Faturayı muhasebe katmanına köprüler: hastanın carisini garanti eder ve
   * SALES_INVOICE_ISSUED ekonomik olayını yazar. dedupeKey ile idempotenttir;
   * olay Outbox'a düşer, posting listener'ı fişi (120 / 600.xx + 391) üretir.
   *
   * Bilinçli olarak try-catch YOK: bu çağrı üstteki outboxRun transaction'ının
   * içinde koşar; köprü (party / financial_event) hata verirse fatura da dahil
   * her şey rollback olmalıdır. Hatayı yutmak sessiz mutabakat kaybı yaratır
   * (fatura kesilir, muhasebe fişi yazılmaz). Komut baştaki resolveExisting +
   * dedupeKey sayesinde idempotenttir; başarısızlıkta çağıran güvenle retry eder.
   */
  private async recordSalesInvoiceIssued(
    input: RecordSalesInvoiceIssuedInput
  ): Promise<void> {
    const ctx = ExecutionContextFactory.createInternal();

    const { partyId } = await this.commandBus.execute(
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

    await this.commandBus.execute(
      new RecordFinancialEventCommand(
        {
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
          sourceModule: FINANCIAL_EVENT_SOURCE_MODULES.INVOICE,
          sourceRefId: input.invoiceId,
          dedupeKey: FinancialEventDedupeKeys.sales_invoice(input.invoiceId),
        },
        ctx
      )
    );
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
        DateTimeManager.create()
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
