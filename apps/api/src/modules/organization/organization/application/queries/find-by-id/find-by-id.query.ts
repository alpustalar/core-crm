import { IGetContext } from '@common/decorators';

import { IQuery } from '@nestjs/cqrs';
import { FindByIdQueryResponse } from '@modules/organization/organization/application/queries/find-by-id/find-by-id.response';

export class FindByIdQuery implements IQuery {
  readonly __responseType!: FindByIdQueryResponse;
  constructor(
    public readonly ctx: IGetContext,
    public readonly organizationId?: string
  ) {}
}
