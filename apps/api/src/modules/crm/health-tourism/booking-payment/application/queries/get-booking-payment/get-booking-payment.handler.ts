import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  BOOKING_PAYMENT_QUERY_REPOSITORY,
  IBookingPaymentQueryRepository,
} from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment.repository';
import { GetBookingPaymentQuery } from './get-booking-payment.query';
import { GetBookingPaymentResponse } from './get-booking-payment.response';

@QueryHandler(GetBookingPaymentQuery)
export class GetBookingPaymentHandler
  implements IQueryHandler<GetBookingPaymentQuery, GetBookingPaymentResponse>
{
  constructor(
    @Inject(BOOKING_PAYMENT_QUERY_REPOSITORY)
    private readonly queryRepo: IBookingPaymentQueryRepository
  ) {}

  async execute(
    query: GetBookingPaymentQuery
  ): Promise<GetBookingPaymentResponse> {
    const bp = await this.queryRepo.findById(query.bookingPaymentId);
    if (!bp) return { data: null };

    return {
      data: {
        id: bp.id.value,
        bookingType: bp.bookingType,
        status: bp.status,
        bookingReference: bp.bookingReference,
        saleAmount: bp.saleAmount.amount.toNumber(),
        saleCurrency: bp.saleCurrency.value,
      },
    };
  }
}
