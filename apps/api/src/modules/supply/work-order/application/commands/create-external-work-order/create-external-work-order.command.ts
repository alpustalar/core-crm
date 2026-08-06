import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { CreateExternalWorkOrder } from '@shared/modules/work-order/types/commands';

export class CreateExternalWorkOrderCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateExternalWorkOrder,
    public readonly ctx: IGetContext
  ) {}
}
