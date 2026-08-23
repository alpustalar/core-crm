import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { GrantUserCapability } from '@shared/modules/user/types/commands';

export class GrantUserCapabilityCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly targetUserId: string;
      readonly data: GrantUserCapability;
      readonly ctx: IGetContext;
    }
  ) {}
}
