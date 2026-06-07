import { IGetContext } from '@common/decorators/get-context.decorator';
import type { PaxRefund } from '@shared/modules/pos/types/commands';

export class PaxRefundCommand {
  constructor(
    public readonly input: PaxRefund,
    public readonly ctx: IGetContext,
  ) {}
}
