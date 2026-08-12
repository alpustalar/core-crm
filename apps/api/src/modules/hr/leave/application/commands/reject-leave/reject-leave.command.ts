import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { ReviewLeave } from '@shared/modules/leave/types/commands';

export class RejectLeaveCommand implements ICommand {
  constructor(
    public readonly payload: {
      leaveId: string;
      data: ReviewLeave;
      ctx: IGetContext;
    }
  ) {}
}
