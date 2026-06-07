import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateProductDto } from '@shared/modules/inventory/dto/commands';

export class CreateProductCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly dto: CreateProductDto,
    public readonly ctx: IGetContext,
  ) {}
}
