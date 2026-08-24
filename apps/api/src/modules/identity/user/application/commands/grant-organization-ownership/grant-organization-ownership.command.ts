import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { GrantOrganizationOwnership } from '@shared/modules/user/types/commands';

export class GrantOrganizationOwnershipCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly targetUserId: string;
      readonly data: GrantOrganizationOwnership;
      readonly ctx: IGetContext;
    }
  ) {}
}
