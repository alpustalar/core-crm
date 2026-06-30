import { IGetContext } from '@common/decorators/get-context.decorator';
import type { IyzicoTerminalSale } from '@shared/modules/pos/types/commands';

export class IyzicoTerminalSaleCommand {
  constructor(
    public readonly input: IyzicoTerminalSale,
    public readonly ctx: IGetContext
  ) {}
}
