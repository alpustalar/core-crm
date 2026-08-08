import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { MarkInvoiceEDocumentResultCommand } from './mark-invoice-edocument-result.command';
import {
  IInvoiceCommandRepository,
  INVOICE_COMMAND_REPOSITORY,
} from '@modules/finance/invoice/domain/repositories/invoice/invoice.command.repository';

@CommandHandler(MarkInvoiceEDocumentResultCommand)
export class MarkInvoiceEDocumentResultHandler
  implements ICommandHandler<MarkInvoiceEDocumentResultCommand, void>
{
  constructor(
    @Inject(INVOICE_COMMAND_REPOSITORY)
    private readonly invoiceRepo: IInvoiceCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: MarkInvoiceEDocumentResultCommand): Promise<void> {
    const { input } = command;

    await this.txManager.run(async () => {
      const invoice = await this.invoiceRepo.findById(input.invoiceId);
      if (!invoice) {
        throw new NotFoundException(`Fatura bulunamadı: ${input.invoiceId}`);
      }
      invoice.applyEDocumentResult({
        documentType: input.documentType,
        uuid: input.uuid,
        status: input.status,
        invoiceNumber: input.invoiceNumber,
      });
      await this.invoiceRepo.update(invoice);
    });
  }
}
