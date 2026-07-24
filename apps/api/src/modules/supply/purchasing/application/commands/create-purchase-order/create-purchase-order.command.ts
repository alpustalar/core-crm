import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreatePurchaseOrder } from '@shared/modules/purchasing';

export class CreatePurchaseOrderCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreatePurchaseOrder,
    public readonly ctx: IGetContext
  ) {}
}
