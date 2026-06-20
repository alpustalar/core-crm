import { CreateUserDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateUserInternalRelations } from '@modules/identity/user/domain/user.contracts';

export class CreateUserCommand {
  constructor(
    public readonly dto: CreateUserDto,
    public readonly ctx: IGetContext,
    public readonly internalRelations?: CreateUserInternalRelations
  ) {}
}
