import { Pagination } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetActionRequiredQueryResponse } from '@modules/appointment/application/queries/get-action-required/get-action-required.response';
import { IQuery } from '@nestjs/cqrs';

export class GetActionRequiredQuery implements IQuery {
  readonly __responseType!: GetActionRequiredQueryResponse;
  constructor(
    public readonly pagination: Pagination,
    public readonly ctx: IGetContext
  ) {}
}
