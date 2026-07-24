import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { AdjustStock } from '@shared';

export interface AdjustStockCommandPayload {
  clinicId: string;
  data: AdjustStock;
  ctx: IGetContext;
}

export class AdjustStockCommand implements ICommand {
  readonly __responseType!: void;
  constructor(public readonly payload: AdjustStockCommandPayload) {}
}
