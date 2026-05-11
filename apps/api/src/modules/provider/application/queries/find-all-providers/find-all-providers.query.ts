import { PaginationDto } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class FindAllProvidersQuery {
  constructor(
    public readonly context: IGetContext,
    public readonly pagination: PaginationDto
  ) {}
}
