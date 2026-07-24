import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { FindInvoicesResponse } from './find-invoices.response';

export interface FindInvoicesQueryPayload {
  pagination: PaginationDto;
  ctx: IGetContext;
  organizationId: string;
  clinicId?: string;
}

export class FindInvoicesQuery implements IQuery {
  readonly __responseType!: FindInvoicesResponse;
  constructor(public readonly payload: FindInvoicesQueryPayload) {}
}
