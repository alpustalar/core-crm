import { IGetContext } from '@common/decorators/get-context.decorator';
import type { IyzicoTerminalRefund } from '@shared/modules/pos/types/commands';

export class IyzicoTerminalRefundCommand {
  constructor(
    public readonly input: IyzicoTerminalRefund,
    public readonly ctx: IGetContext
  ) {}
}
