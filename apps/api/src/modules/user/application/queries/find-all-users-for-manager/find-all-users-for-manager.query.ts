import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindAllUsersForManagerQueryResponse } from '@modules/user/application/queries/find-all-users-for-manager/find-all-users-for-manager.response';

export class FindAllUsersForManagerQuery {
  public readonly __responseType!: FindAllUsersForManagerQueryResponse;
  constructor(
    public readonly dto: PaginationDto,
    public readonly ctx: IGetContext
  ) {}
}
