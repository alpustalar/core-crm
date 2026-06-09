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
    private readonly txManager: TransactionManager
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
        return this.invoiceCommandRepo.save(invoice);
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
}
