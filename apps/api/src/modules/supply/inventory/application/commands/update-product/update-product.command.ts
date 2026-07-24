import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateProduct } from '@shared';

export interface UpdateProductCommandPayload {
  productId: string;
  data: UpdateProduct;
  ctx: IGetContext;
}

export class UpdateProductCommand implements ICommand {
  readonly __responseType!: void;
  constructor(public readonly payload: UpdateProductCommandPayload) {}
}
