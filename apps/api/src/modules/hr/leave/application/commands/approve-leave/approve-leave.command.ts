import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ReviewLeave } from '@shared/modules/leave/schemas/commands/review-leave.schema';

export class ApproveLeaveCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly leaveId: string;
      readonly data: ReviewLeave;
      readonly ctx: IGetContext;
    }
  ) {}
}
