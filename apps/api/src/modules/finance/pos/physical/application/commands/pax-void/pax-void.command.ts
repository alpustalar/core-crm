import { IGetContext } from '@common/decorators/get-context.decorator';
import type { PaxVoid } from '@shared/modules/pos/types/commands';

export class PaxVoidCommand {
  constructor(
    public readonly input: PaxVoid,
    public readonly ctx: IGetContext
  ) {}
}
