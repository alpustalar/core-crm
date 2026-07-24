import { SendUserPasswordResetByActor } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class SendUserPasswordResetLinkByStaffCommand {
  constructor(
    public readonly data: SendUserPasswordResetByActor,
    public readonly ctx: IGetContext
  ) {}
}
