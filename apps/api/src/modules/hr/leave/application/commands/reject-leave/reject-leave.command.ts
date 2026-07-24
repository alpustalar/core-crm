import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ReviewLeave } from '@shared/modules/leave/schemas/commands/review-leave.schema';

export class RejectLeaveCommand implements ICommand {
  constructor(
    public readonly payload: {
      leaveId: string;
      data: ReviewLeave;
      ctx: IGetContext;
    }
  ) {}
}
