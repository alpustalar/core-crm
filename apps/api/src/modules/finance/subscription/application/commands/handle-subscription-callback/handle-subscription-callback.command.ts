import { ICommand } from '@nestjs/cqrs';

export class HandleSubscriptionCallbackCommand implements ICommand {
  constructor(
    public readonly token: string,
    public readonly conversationId: string
  ) {}
}
