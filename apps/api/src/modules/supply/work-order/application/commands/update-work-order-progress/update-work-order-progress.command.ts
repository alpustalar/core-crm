import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { UpdateWorkOrderProgress } from '@shared/modules/work-order/types/commands';

export class UpdateWorkOrderProgressCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly workOrderId: string;
      readonly data: UpdateWorkOrderProgress;
      readonly ctx: IGetContext;
    }
  ) {}
}
