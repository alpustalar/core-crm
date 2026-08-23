import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';

export class UnmatchPurchaseInvoiceCommand implements ICommand {
  constructor(
    public readonly invoiceId: string,
    public readonly ctx: IGetContext
  ) {}
}
