import { PaginationDto } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { FindAllProvidersQueryResponse } from '@modules/provider/application/queries/find-all-providers/find-all-providers.response';

export class FindAllProvidersQuery implements IQuery {
  readonly __responseType!: FindAllProvidersQueryResponse;
  constructor(
    public readonly ctx: IGetContext,
    public readonly pagination: PaginationDto
  ) {}
}
