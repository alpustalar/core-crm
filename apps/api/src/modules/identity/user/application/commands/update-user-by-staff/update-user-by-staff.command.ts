// update-user-by-staff.command.ts
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateUserByStaffDto } from '@shared/modules/user/dto/commands/update-user-by-staff.dto';

export class UpdateUserByStaffCommand {
  constructor(
    public readonly targetUserId: string,
    public readonly dto: UpdateUserByStaffDto,
    public readonly ctx: IGetContext
  ) {}
}
