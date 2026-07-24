import { IGetContext } from '@common/decorators/get-context.decorator';

export class MarkAllNotificationsReadCommand {
  constructor(public readonly ctx: IGetContext) {}
}
