// update-user-by-staff.command.ts
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateUserByStaff } from '@shared';

export class UpdateUserByStaffCommand {
  constructor(
    public readonly payload: {
      targetUserId: string;
      data: UpdateUserByStaff;
      ctx: IGetContext;
    }
  ) {}
}
