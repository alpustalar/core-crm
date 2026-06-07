import { IGetContext } from '@common/decorators/get-context.decorator';

export class SendUserPasswordResetLinkBySelfCommand {
  constructor(public readonly ctx: IGetContext) {}
}
