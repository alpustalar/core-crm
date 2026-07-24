import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ReconcileStatementLine } from '@shared/modules/bank/types/commands';

export class ReconcileStatementLineCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly lineId: string;
      readonly data: ReconcileStatementLine;
      readonly ctx: IGetContext;
    }
  ) {}
}
