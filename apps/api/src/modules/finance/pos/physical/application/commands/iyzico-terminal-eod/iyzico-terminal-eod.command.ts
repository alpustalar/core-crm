import { IGetContext } from '@common/decorators/get-context.decorator';
import type { IyzicoTerminalEod } from '@shared/modules/pos/types/commands';

export interface IyzicoTerminalEodInput extends IyzicoTerminalEod {
  posDeviceId: string;
}

export class IyzicoTerminalEodCommand {
  constructor(
    public readonly input: IyzicoTerminalEodInput,
    public readonly ctx: IGetContext
  ) {}
}
