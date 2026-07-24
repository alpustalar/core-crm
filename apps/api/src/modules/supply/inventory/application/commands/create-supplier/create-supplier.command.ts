import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateSupplier } from '@shared';

export class CreateSupplierCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateSupplier,
    public readonly ctx: IGetContext
  ) {}
}
