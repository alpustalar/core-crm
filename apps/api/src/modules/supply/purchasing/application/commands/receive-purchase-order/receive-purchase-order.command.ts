import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ReceivePurchaseOrder } from '@shared/modules/purchasing';

export class ReceivePurchaseOrderCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly orderId: string;
      readonly data: ReceivePurchaseOrder;
      readonly ctx: IGetContext;
    }
  ) {}
}
