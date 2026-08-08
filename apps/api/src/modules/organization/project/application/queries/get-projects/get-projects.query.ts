import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { Pagination } from '@shared';
import type { GetProjects } from '@shared/modules/project/types/queries';
import { GetProjectsResponse } from './get-projects.response';

export class GetProjectsQuery implements IQuery {
  readonly __responseType!: GetProjectsResponse;

  constructor(
    public readonly payload: {
      readonly filter: GetProjects;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
