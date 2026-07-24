import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { RequestLeave } from '@shared/modules/leave/schemas/commands/request-leave.schema';

export class RequestLeaveCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      employeeId: string;
      data: RequestLeave;
      ctx: IGetContext;
    }
  ) {}
}
