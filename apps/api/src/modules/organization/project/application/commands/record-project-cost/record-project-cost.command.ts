import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { RecordProjectCost } from '@shared/modules/project/types/commands';

export class RecordProjectCostCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly projectId: string;
      readonly data: RecordProjectCost;
      readonly ctx: IGetContext;
    }
  ) {}
}
