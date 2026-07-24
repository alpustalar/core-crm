import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetInvoiceByPaymentIdResponse } from './get-invoice-by-payment-id.response';

export class GetInvoiceByPaymentIdQuery implements IQuery {
  readonly __responseType!: GetInvoiceByPaymentIdResponse;
  constructor(
    public readonly paymentId: string,
    public readonly ctx: IGetContext
  ) {}
}
