// update-user-by-self.command.ts
import { UserUpdateBySelfDto } from '@shared';
import { ActorContext } from '@common/interfaces';

export class UpdateUserBySelfCommand {
  constructor(
    public readonly dto: UserUpdateBySelfDto,
    public readonly actor: ActorContext
  ) {}
}
