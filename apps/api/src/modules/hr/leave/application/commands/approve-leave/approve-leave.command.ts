import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { ReviewLeave } from '@shared/modules/leave/types/commands';

export class ApproveLeaveCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly leaveId: string;
      readonly data: ReviewLeave;
      readonly ctx: IGetContext;
    }
  ) {}
}
