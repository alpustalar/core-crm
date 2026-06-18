import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentWithInstallmentsQuery } from './get-payment-with-installments.query';
import { GetPaymentWithInstallmentsResponse } from './get-payment-with-installments.response';
import {
  IPaymentQueryRepository,
  PAYMENT_QUERY_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';

@QueryHandler(GetPaymentWithInstallmentsQuery)
export class GetPaymentWithInstallmentsHandler
  implements
    IQueryHandler<
      GetPaymentWithInstallmentsQuery,
      GetPaymentWithInstallmentsResponse
    >
{
  constructor(
    @Inject(PAYMENT_QUERY_REPOSITORY)
    private readonly paymentQueryRepo: IPaymentQueryRepository
  ) {}

  execute(
    query: GetPaymentWithInstallmentsQuery
  ): Promise<GetPaymentWithInstallmentsResponse> {
    return this.paymentQueryRepo.findPaymentWithInstallments(query.paymentId);
  }
}
