import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { RecordCashMovement } from '@shared/modules/cash-register/types/commands';

export class RecordCashMovementCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly sessionId: string;
      readonly data: RecordCashMovement;
      readonly ctx: IGetContext;
    }
  ) {}
}
