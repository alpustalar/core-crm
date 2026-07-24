import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateProduct } from '@shared';

export class CreateProductCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateProduct,
    public readonly ctx: IGetContext
  ) {}
}
