import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { MatchPurchaseInvoice } from '@shared/modules/purchase-invoice/types/commands';

export class MatchPurchaseInvoiceCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly invoiceId: string;
      readonly data: MatchPurchaseInvoice;
      readonly ctx: IGetContext;
    }
  ) {}
}
