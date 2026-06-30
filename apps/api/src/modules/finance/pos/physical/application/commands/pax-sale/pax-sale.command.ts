import { IGetContext } from '@common/decorators/get-context.decorator';
import type { PaxSale } from '@shared/modules/pos/types/commands';

export class PaxSaleCommand {
  constructor(
    public readonly input: PaxSale,
    public readonly ctx: IGetContext
  ) {}
}
