import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindSuppliersResponse } from './find-suppliers.response';
import { PaginationDto } from '@shared';

export class FindSuppliersQuery implements IQuery {
  readonly __responseType!: FindSuppliersResponse;
  constructor(
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext
  ) {}
}
