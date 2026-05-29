import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { IssueInvoiceCommand } from './issue-invoice.command';
import { IssueInvoiceResponse } from './issue-invoice.response';
import {
  INVOICE_COMMAND_REPOSITORY,
  INVOICE_QUERY_REPOSITORY,
  IInvoiceCommandRepository,
  IInvoiceQueryRepository,
} from '@modules/invoice/domain/repositories/invoice.repository';
import {
  INVOICE_PROVIDER,
  IInvoiceProvider,
} from '@modules/invoice/domain/interfaces/invoice-provider.interface';
import { ContextService } from '@src/infrastructure/context/context.service';
import { CONTEXT_SERVICE } from '@src/infrastructure/context/domain/interfaces/context.service.interface';
import { InvoiceIssuedEvent } from '@modules/invoice/domain/events/invoice-issued.event';
import { InvoiceFailedEvent } from '@modules/invoice/domain/events/invoice-failed.event';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import { InvoiceStatus } from '@prisma/client';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

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
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: ContextService,
    private readonly txManager: TransactionManager,
  ) {}

  async execute(command: IssueInvoiceCommand): Promise<IssueInvoiceResponse> {
    const { input } = command;

    const existing = await this.resolveExisting(input);
    if (existing) {
      this.logger.log(`Fatura zaten mevcut, atlanıyor. invoiceId=${existing.id}`);
      return { invoiceId: existing.id, invoiceNumber: existing.invoiceNumber, status: existing.status };
    }

    const invoiceId = crypto.randomUUID();

    // DB kaydı oluştur (dış servis çağrısından önce, ayrı transaction)
    const invoice = await this.txManager.run(() =>
      this.invoiceCommandRepo.create({
        id: invoiceId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        paymentId: input.paymentId,
        amount: input.amount,
        currency: input.currency ?? 'TRY',
        status: InvoiceStatus.PENDING,
      }),
    );

    // Dış servis çağrısı transaction dışında
    try {
      const result = await this.invoiceProvider.issue({
        invoiceId,
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        paymentId: input.paymentId,
        amount: Number(invoice.amount),
        currency: invoice.currency,
      });

      // Başarı: güncelleme + event atomik olarak
      const issued = await this.txManager.outboxRun(async () => {
        const saved = await this.invoiceCommandRepo.markAsIssued({
          invoiceId,
          invoiceNumber: result.invoiceNumber,
          providerRef: result.providerRef,
          issuedAt: result.issuedAt,
          rawResponse: result.rawResponse,
        });

        this.contextService.addEvent(
          new InvoiceIssuedEvent({
            invoiceId,
            clinicId: input.clinicId,
            patientId: input.patientId,
            appointmentId: input.appointmentId,
            paymentId: input.paymentId,
            invoiceNumber: result.invoiceNumber,
            action: LogAction.INVOICE_ISSUED,
            type: LogType.INFO,
            source: input.source,
            actorId: input.actorId,
          }),
        );

        return saved;
      });

      return { invoiceId, invoiceNumber: issued.invoiceNumber, status: issued.status };
    } catch (error) {
      // Hata: güncelleme + event atomik olarak
      await this.txManager.outboxRun(async () => {
        await this.invoiceCommandRepo.markAsFailed(invoiceId);

        this.contextService.addEvent(
          new InvoiceFailedEvent({
            invoiceId,
            clinicId: input.clinicId,
            patientId: input.patientId,
            appointmentId: input.appointmentId,
            paymentId: input.paymentId,
            reason: error instanceof Error ? error.message : 'Bilinmeyen hata',
            action: LogAction.INVOICE_FAILED,
            type: LogType.ERROR,
            source: input.source,
            actorId: input.actorId,
          }),
        );
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
}
