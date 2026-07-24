import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateUser } from '@modules/identity/user/domain/contracts/user.contracts';

export class CreateUserCommand {
  constructor(
    public readonly data: CreateUser,
    public readonly ctx: IGetContext
  ) {}
}
