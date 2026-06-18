import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { GetPurchaseInvoicesResponse } from './get-purchase-invoices.response';

export class GetPurchaseInvoicesQuery implements IQuery {
  readonly __responseType!: GetPurchaseInvoicesResponse;
  constructor(
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext
  ) {}
}
