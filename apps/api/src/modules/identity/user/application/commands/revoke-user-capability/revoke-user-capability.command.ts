import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';

export class RevokeUserCapabilityCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly targetUserId: string;
      readonly capability: string;
      readonly ctx: IGetContext;
    }
  ) {}
}
