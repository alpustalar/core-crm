import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CloseCashSession } from '@shared/modules/cash-register/types/commands';
import { CloseCashSessionResponse } from './close-cash-session.response';

export class CloseCashSessionCommand implements ICommand {
  readonly __responseType!: CloseCashSessionResponse;
  constructor(
    public readonly payload: {
      readonly sessionId: string;
      readonly data: CloseCashSession;
      readonly ctx: IGetContext;
    }
  ) {}
}
