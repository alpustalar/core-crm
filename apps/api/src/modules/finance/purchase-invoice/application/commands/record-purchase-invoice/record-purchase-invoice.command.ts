import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { RecordPurchaseInvoice } from '@shared/modules/purchase-invoice/types/commands';

export class RecordPurchaseInvoiceCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: RecordPurchaseInvoice,
    public readonly ctx: IGetContext
  ) {}
}
