import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentWithInstallmentsQuery } from './get-payment-with-installments.query';
import { GetPaymentWithInstallmentsResponse } from './get-payment-with-installments.response';
import {
  IPaymentQueryRepository,
  PAYMENT_QUERY_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { paymentHasInstallments } from '@shared/modules/payment/interfaces/payment-with-installments.interface';
import { QueryResponseNull } from '@common/constants';

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

  async execute(
    query: GetPaymentWithInstallmentsQuery
  ): Promise<GetPaymentWithInstallmentsResponse> {
    const payment = await this.paymentQueryRepo.findPaymentWithInstallments(
      query.paymentId
    );

    if (!payment) {
      return QueryResponseNull;
    }

    const { installments } = payment;

    const raw = payment.toPersistence();

    const persistenceData = {
      ...raw,
      installments: [...installments],
    };

    const isWithInstallments = paymentHasInstallments(persistenceData);

    return {
      data: isWithInstallments ? persistenceData : null,
    };
  }
}
