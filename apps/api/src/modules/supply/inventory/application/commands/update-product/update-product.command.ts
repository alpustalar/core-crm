import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateProductDto } from '@shared/modules/inventory/dto/commands';

export class UpdateProductCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly productId: string,
    public readonly dto: UpdateProductDto,
    public readonly ctx: IGetContext,
  ) {}
}
