import { IGetContext } from '@common/decorators/get-context.decorator';
import type { IyzicoTerminalVoid } from '@shared/modules/pos/types/commands';

export class IyzicoTerminalVoidCommand {
  constructor(
    public readonly input: IyzicoTerminalVoid,
    public readonly ctx: IGetContext
  ) {}
}
