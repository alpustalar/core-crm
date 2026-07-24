import { ChangeUserPassword } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ChangePasswordCommand {
  constructor(
    readonly data: ChangeUserPassword,
    readonly ctx: IGetContext
  ) {}
}
