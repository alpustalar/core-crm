// soft-delete-user-by-staff.command.ts
import { UserSoftDeleteByActorDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class SoftDeleteUserByStaffCommand {
  constructor(
    public readonly dto: UserSoftDeleteByActorDto,
    public readonly ctx: IGetContext
  ) {}
}
