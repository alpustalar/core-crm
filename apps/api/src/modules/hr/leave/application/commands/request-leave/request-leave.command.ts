import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { RequestLeave } from '@shared/modules/leave/types/commands';

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
