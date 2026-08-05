import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IInvoiceCommandRepository,
  IInvoiceQueryRepository,
  INVOICE_COMMAND_REPOSITORY,
  INVOICE_QUERY_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice.repository';
import { MarkInvoiceEDocumentResultCommand } from './mark-invoice-edocument-result.command';

@CommandHandler(MarkInvoiceEDocumentResultCommand)
export class MarkInvoiceEDocumentResultHandler implements ICommandHandler<
  MarkInvoiceEDocumentResultCommand,
  void
> {
  constructor(
    @Inject(INVOICE_COMMAND_REPOSITORY)
    private readonly invoiceCommandRepo: IInvoiceCommandRepository,
    @Inject(INVOICE_QUERY_REPOSITORY)
    private readonly invoiceQueryRepo: IInvoiceQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkInvoiceEDocumentResultCommand): Promise<void> {
    const { input } = command;

    await this.txManager.run(async () => {
      const invoice = await this.invoiceQueryRepo.findById(input.invoiceId);
      if (!invoice) {
        throw new NotFoundException(`Fatura bulunamadı: ${input.invoiceId}`);
      }
      invoice.applyEDocumentResult({
        documentType: input.documentType,
        uuid: input.uuid,
        status: input.status,
        invoiceNumber: input.invoiceNumber,
      });
      await this.invoiceCommandRepo.update(invoice);
    });
  }
}
