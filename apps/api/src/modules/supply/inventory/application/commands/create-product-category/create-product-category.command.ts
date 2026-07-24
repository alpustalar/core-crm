import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateProductCategory } from '@shared';

export class CreateProductCategoryCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateProductCategory,
    public readonly ctx: IGetContext
  ) {}
}
