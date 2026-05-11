import { SendUserPasswordResetByActorDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class SendUserPasswordResetLinkByStaffCommand {
  constructor(
    public readonly dto: SendUserPasswordResetByActorDto,
    public readonly context: IGetContext
  ) {}
}
