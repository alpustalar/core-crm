import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { AdjustStockDto } from '@shared/modules/inventory/dto/commands';

export class AdjustStockCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly clinicId: string,
    public readonly dto: AdjustStockDto,
    public readonly ctx: IGetContext,
  ) {}
}
