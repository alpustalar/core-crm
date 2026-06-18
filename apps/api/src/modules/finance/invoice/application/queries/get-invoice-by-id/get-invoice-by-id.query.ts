import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetInvoiceByIdResponse } from './get-invoice-by-id.response';

export class GetInvoiceByIdQuery implements IQuery {
  readonly __responseType!: GetInvoiceByIdResponse;
  constructor(
    public readonly invoiceId: string,
    public readonly ctx: IGetContext
  ) {}
}
