// soft-delete-user-by-staff.command.ts
import { UserSoftDeleteByActor } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class SoftDeleteUserByStaffCommand {
  constructor(
    public readonly data: UserSoftDeleteByActor,
    public readonly ctx: IGetContext
  ) {}
}
