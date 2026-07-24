import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreatePurchaseRequest } from '@shared/modules/purchasing';

export class CreatePurchaseRequestCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreatePurchaseRequest,
    public readonly ctx: IGetContext
  ) {}
}
