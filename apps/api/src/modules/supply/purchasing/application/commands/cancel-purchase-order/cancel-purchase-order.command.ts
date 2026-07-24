import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CancelPurchaseOrderCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly ctx: IGetContext
  ) {}
}
