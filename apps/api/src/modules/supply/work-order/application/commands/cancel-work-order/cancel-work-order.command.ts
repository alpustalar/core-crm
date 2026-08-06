import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { CancelWorkOrder } from '@shared/modules/work-order/types/commands';

export class CancelWorkOrderCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly workOrderId: string;
      readonly data: CancelWorkOrder;
      readonly ctx: IGetContext;
    }
  ) {}
}
