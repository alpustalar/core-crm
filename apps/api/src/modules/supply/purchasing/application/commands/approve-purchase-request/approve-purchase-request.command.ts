import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ReviewPurchaseRequest } from '@shared/modules/purchasing';

export class ApprovePurchaseRequestCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly requestId: string;
      readonly data: ReviewPurchaseRequest;
      readonly ctx: IGetContext;
    }
  ) {}
}
