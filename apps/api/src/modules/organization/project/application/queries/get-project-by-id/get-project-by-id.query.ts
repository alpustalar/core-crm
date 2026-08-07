import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetProjectByIdResponse } from './get-project-by-id.response';

export class GetProjectByIdQuery implements IQuery {
  readonly __responseType!: GetProjectByIdResponse;

  constructor(
    public readonly projectId: string,
    public readonly ctx: IGetContext
  ) {}
}
