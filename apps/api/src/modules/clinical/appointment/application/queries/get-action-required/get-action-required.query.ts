import { GetActionRequiredQueryResponse } from '@modules/clinical/appointment/application/queries/get-action-required/get-action-required.response';
import { IQuery } from '@nestjs/cqrs';
import { Pagination } from '@shared';
import { IGetContext } from '@common/decorators';

export class GetActionRequiredQuery implements IQuery {
  readonly __responseType!: GetActionRequiredQueryResponse;
  constructor(
    public readonly payload: {
      readonly pagination: Pagination;
      readonly clinicId: string;
      readonly ctx: IGetContext;
    }
  ) {}
}
