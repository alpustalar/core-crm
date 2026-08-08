import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { Pagination } from '@shared';
import type { GetMyProjectTasks } from '@shared/modules/project/types/queries';
import { GetMyProjectTasksResponse } from './get-my-project-tasks.response';

export class GetMyProjectTasksQuery implements IQuery {
  readonly __responseType!: GetMyProjectTasksResponse;

  constructor(
    public readonly payload: {
      readonly filter: GetMyProjectTasks;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
