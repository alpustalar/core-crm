import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { IssueInvoiceCommand } from './issue-invoice.command';
import { IssueInvoiceResponse } from './issue-invoice.response';
import {
  IInvoiceCommandRepository,
  IInvoiceQueryRepository,
  INVOICE_COMMAND_REPOSITORY,
  INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice.repository';
import {
  IInvoiceProvider,
  INVOICE_PROVIDER,
} from '@modules/finance/invoice/domain/interfaces/invoice-provider.interface';
import { FinancialEventType, InvoiceStatus, PartyRole } from '@prisma/client';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { Invoice } from '@modules/finance/invoice/domain/entities/invoice.entity';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';

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
    @Inject(INVOICE_PROVIDER)
    private readonly invoiceProvider: IInvoiceProvider,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(command: IssueInvoiceCommand): Promise<IssueInvoiceResponse> {
    const { input } = command;

    const existing = await this.resolveExisting(input);
    if (existing) {
      this.logger.log(
        `Fatura zaten mevcut, atlanıyor. invoiceId=${existing.id}`
      );
      return {
        invoiceId: existing.id,
        invoiceNumber: existing.invoiceNumber,
        status: existing.status,
      };
    }

    const invoiceId = crypto.randomUUID();
    const vatRate = input.vatRate ?? 10;
    const { netTotal, vatTotal } = Invoice.splitVatInclusive(
      input.amount,
      vatRate
    );

    // DB kaydı oluştur (dış servis çağrısından önce, ayrı transaction)
    await this.txManager.run(() =>
      this.invoiceCommandRepo.create({
        id: invoiceId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        paymentId: input.paymentId,
        amount: input.amount,
        currency: input.currency ?? 'TRY',
        vatRate,
        netTotal,
        vatTotal,
        status: InvoiceStatus.PENDING,
      })
    );

    // Dış servis çağrısı transaction dışında
    try {
      const result = await this.invoiceProvider.issue({
        invoiceId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        paymentId: input.paymentId,
        amount: input.amount,
        currency: input.currency ?? 'TRY',
      });

      // Başarı: güncelleme + event atomik olarak
      const issued = await this.txManager.outboxRun(async () => {
        const invoice = await this.invoiceQueryRepo.findById(invoiceId);
        if (!invoice) throw new NotFoundException('Fatura bulunamadı.');
        invoice.issue({
          invoiceNumber: result.invoiceNumber,
          providerRef: result.providerRef,
          issuedAt: result.issuedAt,
          rawResponse: result.rawResponse,
          source: input.source,
          actorId: input.actorId,
        });
        const savedInvoice = await this.invoiceCommandRepo.save(invoice);

        // Muhasebe köprüsü: cari garanti + ekonomik olay (aynı outboxRun → atomik).
        await this.recordSalesInvoiceIssued({
          invoiceId: savedInvoice.id,
          clinicId: savedInvoice.clinicId,
          patientId: savedInvoice.patientId,
          netTotal: savedInvoice.netTotal.toString(),
          vatTotal: savedInvoice.vatTotal.toString(),
          grandTotal: savedInvoice.amount.toString(),
          issuedAt: savedInvoice.issuedAt ?? new Date(),
        });

        return savedInvoice;
      });

      return {
        invoiceId,
        invoiceNumber: issued.invoiceNumber,
        status: issued.status,
      };
    } catch (error) {
      // Hata: güncelleme + event atomik olarak
      await this.txManager.outboxRun(async () => {
        const invoice = await this.invoiceQueryRepo.findById(invoiceId);
        if (!invoice) throw new NotFoundException('Fatura bulunamadı.');
        invoice.fail({
          reason: error instanceof Error ? error.message : 'Bilinmeyen hata',
          source: input.source,
          actorId: input.actorId,
        });
        await this.invoiceCommandRepo.save(invoice);
      });

      throw error;
    }
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
          PartyRole.CUSTOMER,
          ctx
        )
      );

      // TODO: dedupe key ve source modeli enum oluşturup öyle kullan
      await this.commandBus.execute(
        new RecordFinancialEventCommand(
          {
            organizationId,
            clinicId: input.clinicId,
            type: FinancialEventType.SALES_INVOICE_ISSUED,
            occurredAt: input.issuedAt,
            payload: {
              partyId,
              netTotal: input.netTotal,
              vatTotal: input.vatTotal,
              grandTotal: input.grandTotal,
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
