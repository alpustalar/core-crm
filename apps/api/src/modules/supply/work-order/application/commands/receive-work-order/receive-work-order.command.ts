import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { ReceiveWorkOrder } from '@shared/modules/work-order/types/commands';

export class ReceiveWorkOrderCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly workOrderId: string;
      readonly data: ReceiveWorkOrder;
      readonly ctx: IGetContext;
    }
  ) {}
}
