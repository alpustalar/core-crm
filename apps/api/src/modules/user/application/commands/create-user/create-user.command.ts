import { CreateUserDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateUserInternalRelations } from '@modules/user/domain/types/create-user-internal-relations.type';

export class CreateUserCommand {
  constructor(
    public readonly dto: CreateUserDto,
    public readonly context: IGetContext,
    public readonly internalRelations?: CreateUserInternalRelations
  ) {}
}
