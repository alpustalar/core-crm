import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { FindSuppliersResponse } from './find-suppliers.response';
import { PaginationDto } from '@shared';

interface FindSuppliersQueryPayload {
  organizationId: string;
  pagination: PaginationDto;
  ctx: IGetContext;
}

export class FindSuppliersQuery implements IQuery {
  readonly __responseType!: FindSuppliersResponse;
  constructor(public readonly payload: FindSuppliersQueryPayload) {}
}
