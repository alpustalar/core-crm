import { ChangeUserPasswordDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ChangePasswordCommand {
  constructor(
    readonly dto: ChangeUserPasswordDto,
    readonly ctx: IGetContext
  ) {}
}
