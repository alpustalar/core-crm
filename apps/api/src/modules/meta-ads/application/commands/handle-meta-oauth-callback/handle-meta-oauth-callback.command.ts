import { ICommand } from '@nestjs/cqrs';

export class HandleMetaOAuthCallbackCommand implements ICommand {
  constructor(
    public readonly code: string,
    public readonly state: string,
  ) {}
}
