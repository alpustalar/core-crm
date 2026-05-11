// update-user-by-staff.command.ts
import { UpdateUserByActorDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class UpdateUserByStaffCommand {
  constructor(
    public readonly targetUserId: string,
    public readonly dto: UpdateUserByActorDto,
    public readonly context: IGetContext
  ) {}
}
