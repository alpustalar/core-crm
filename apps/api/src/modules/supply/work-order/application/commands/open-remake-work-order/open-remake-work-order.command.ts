import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { OpenRemakeWorkOrder } from '@shared/modules/work-order/types/commands';

export class OpenRemakeWorkOrderCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      readonly workOrderId: string;
      readonly data: OpenRemakeWorkOrder;
      readonly ctx: IGetContext;
    }
  ) {}
}
