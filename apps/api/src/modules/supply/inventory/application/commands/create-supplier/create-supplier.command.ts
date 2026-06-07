import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateSupplierDto } from '@shared/modules/inventory/dto/commands';

export class CreateSupplierCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly dto: CreateSupplierDto,
    public readonly ctx: IGetContext,
  ) {}
}
