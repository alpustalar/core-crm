import { IGetContext } from '@common/decorators/get-context.decorator';

export class MarkNotificationReadCommand {
  constructor(
    public readonly notificationId: string,
    public readonly ctx: IGetContext
  ) {}
}
