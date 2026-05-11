import { CreateUserDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class CreateUserCommand {
  constructor(
    public readonly dto: CreateUserDto,
    public readonly context: IGetContext
  ) {}
}
