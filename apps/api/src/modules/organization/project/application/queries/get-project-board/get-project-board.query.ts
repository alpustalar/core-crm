import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import type { GetProjectTasks } from '@shared/modules/project/types/queries';
import { GetProjectBoardResponse } from './get-project-board.response';

export class GetProjectBoardQuery implements IQuery {
  readonly __responseType!: GetProjectBoardResponse;

  constructor(
    public readonly payload: {
      readonly projectId: string;
      readonly filter: GetProjectTasks;
      readonly ctx: IGetContext;
    }
  ) {}
}
