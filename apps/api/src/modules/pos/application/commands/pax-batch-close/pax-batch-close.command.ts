import { IGetContext } from '@common/decorators/get-context.decorator';
import type { PaxBatchClose } from '@shared/modules/pos/types/commands';

export interface PaxBatchCloseInput extends PaxBatchClose {
  posDeviceId: string;
}

export class PaxBatchCloseCommand {
  constructor(
    public readonly input: PaxBatchCloseInput,
    public readonly ctx: IGetContext,
  ) {}
}
