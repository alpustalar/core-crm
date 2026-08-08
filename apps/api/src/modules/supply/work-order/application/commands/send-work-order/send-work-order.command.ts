import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { SendWorkOrder } from '@shared/modules/work-order/types/commands';

export class SendWorkOrderCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly workOrderId: string;
      readonly data: SendWorkOrder;
      readonly ctx: IGetContext;
    }
  ) {}
}
