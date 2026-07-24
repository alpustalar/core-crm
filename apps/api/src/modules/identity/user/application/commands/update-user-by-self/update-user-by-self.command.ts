import { UserUpdateBySelf } from '@shared';
import { ActorContext } from '@common/interfaces';

export class UpdateUserBySelfCommand {
  constructor(
    public readonly data: UserUpdateBySelf,
    public readonly actor: ActorContext
  ) {}
}
