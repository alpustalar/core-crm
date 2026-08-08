import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { AutoMatchStatementLines } from '@shared/modules/bank/types/commands';

export class AutoMatchStatementLinesCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly bankStatementId: string;
      readonly data: AutoMatchStatementLines;
      readonly ctx: IGetContext;
    }
  ) {}
}
