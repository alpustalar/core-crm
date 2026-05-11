import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class FindAllUsersForManagerQuery {
  constructor(
    public readonly dto: PaginationDto,
    public readonly context: IGetContext
  ) {}
}
