import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { FitWorkOrder } from '@shared/modules/work-order/types/commands';

export class FitWorkOrderCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly workOrderId: string;
      readonly data: FitWorkOrder;
      readonly ctx: IGetContext;
    }
  ) {}
}
