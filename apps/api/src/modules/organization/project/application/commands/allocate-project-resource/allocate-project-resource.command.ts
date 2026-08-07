import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { AllocateProjectResource } from '@shared/modules/project/types/commands';

export class AllocateProjectResourceCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly projectId: string;
      readonly data: AllocateProjectResource;
      readonly ctx: IGetContext;
    }
  ) {}
}
