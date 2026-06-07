import { IQuery } from '@nestjs/cqrs';
import { GetPaymentWithInstallmentsResponse } from './get-payment-with-installments.response';

export class GetPaymentWithInstallmentsQuery implements IQuery {
  readonly __responseType!: GetPaymentWithInstallmentsResponse;
  constructor(public readonly paymentId: string) {}
}
