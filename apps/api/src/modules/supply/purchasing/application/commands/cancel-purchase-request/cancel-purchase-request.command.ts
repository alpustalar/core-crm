import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CancelPurchaseRequestCommand implements ICommand {
  constructor(
    public readonly requestId: string,
    public readonly ctx: IGetContext
  ) {}
}
