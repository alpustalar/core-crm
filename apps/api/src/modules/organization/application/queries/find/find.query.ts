import { IGetContext } from '@common/decorators';
import { FindQueryResponse } from '@modules/organization/application/queries/find/find.response';
import { IQuery } from '@nestjs/cqrs';

export class FindQuery implements IQuery {
  readonly __responseType!: FindQueryResponse;
  constructor(
    public readonly ctx: IGetContext,
    public readonly organizationId?: string
  ) {}
}
