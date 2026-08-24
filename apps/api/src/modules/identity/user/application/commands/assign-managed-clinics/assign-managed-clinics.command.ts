import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { AssignManagedClinics } from '@shared/modules/user/types/commands';

export class AssignManagedClinicsCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly targetUserId: string;
      readonly data: AssignManagedClinics;
      readonly ctx: IGetContext;
    }
  ) {}
}
