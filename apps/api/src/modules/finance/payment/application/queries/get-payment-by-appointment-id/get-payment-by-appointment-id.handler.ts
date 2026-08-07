import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentByAppointmentIdQuery } from './get-payment-by-appointment-id.query';
import { GetPaymentByAppointmentIdResponse } from './get-payment-by-appointment-id.response';
import {
  IPaymentQueryRepository,
  PAYMENT_QUERY_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';

@QueryHandler(GetPaymentByAppointmentIdQuery)
export class GetPaymentByAppointmentIdHandler
  implements
    IQueryHandler<
      GetPaymentByAppointmentIdQuery,
      GetPaymentByAppointmentIdResponse
    >
{
  constructor(
    @Inject(PAYMENT_QUERY_REPOSITORY)
    private readonly paymentQueryRepo: IPaymentQueryRepository
  ) {}

  async execute(
    query: GetPaymentByAppointmentIdQuery
  ): Promise<GetPaymentByAppointmentIdResponse> {
    const payment = await this.paymentQueryRepo.findByAppointmentId(
      query.appointmentId
    );

    return {
      data: payment,
    };
  }
}
