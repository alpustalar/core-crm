import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { Pagination } from '@shared/common';
import { GetMyTasksResponse } from './get-my-tasks.response';
import { GetMyTasks } from '@shared/modules/activity';

export class GetMyTasksQuery implements IQuery {
  readonly __responseType!: GetMyTasksResponse;
  constructor(
    public readonly payload: {
      filter: GetMyTasks;
      pagination: Pagination;
      ctx: IGetContext;
      clinicId: string;
    }
  ) {}
}
