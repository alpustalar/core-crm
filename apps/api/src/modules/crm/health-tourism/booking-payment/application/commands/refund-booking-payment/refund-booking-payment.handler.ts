import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  IPaymentLinkProvider,
  IYZICO_PAYMENT_LINK,
  STRIPE_PAYMENT_LINK,
} from '@src/infrastructure/payment/links/payment-link.port';
import {
  BOOKING_PAYMENT_COMMAND_REPOSITORY,
  BOOKING_PAYMENT_QUERY_REPOSITORY,
  IBookingPaymentCommandRepository,
  IBookingPaymentQueryRepository,
} from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment.repository';
import { RefundBookingPaymentCommand } from './refund-booking-payment.command';
import { PaymentProviders } from '@common/constants';
import { Currency } from '@src/domain/value-objects/currency.vo';

@CommandHandler(RefundBookingPaymentCommand)
export class RefundBookingPaymentHandler
  implements ICommandHandler<RefundBookingPaymentCommand, void>
{
  private readonly logger = new Logger(RefundBookingPaymentHandler.name);

  constructor(
    @Inject(IYZICO_PAYMENT_LINK)
    private readonly iyzicoLink: IPaymentLinkProvider,
    @Inject(STRIPE_PAYMENT_LINK)
    private readonly stripeLink: IPaymentLinkProvider,
    @Inject(BOOKING_PAYMENT_QUERY_REPOSITORY)
    private readonly bookingPaymentQueryRepo: IBookingPaymentQueryRepository,
    @Inject(BOOKING_PAYMENT_COMMAND_REPOSITORY)
    private readonly bookingPaymentCommandRepo: IBookingPaymentCommandRepository
  ) {}

  async execute(command: RefundBookingPaymentCommand): Promise<void> {
    const { bookingId, reason } = command;

    const bp = await this.bookingPaymentQueryRepo.findByBookingId(bookingId);
    // B7 öncesi/ödemesiz rezervasyonda kayıt olmayabilir → iptal akışını bozmadan geç.
    if (!bp) {
      this.logger.warn(
        `İade için ödeme kaydı bulunamadı (bookingId=${bookingId}); atlandı.`
      );
      return;
    }

    if (bp.status !== 'BOOKED') {
      this.logger.warn(
        `İade atlandı (bp=${bp.id.value}); durum BOOKED değil (mevcut: ${bp.status}).`
      );
      return;
    }
    if (!bp.paidProvider || !bp.paidProviderRef) {
      this.logger.warn(
        `İade atlandı (bp=${bp.id.value}); ödeme referansı yok.`
      );
      return;
    }

    // v1: tam satış tutarı iade (HotelBeds iptal cezası mahsubu sonraki iterasyon).
    const adapter =
      bp.paidProvider === PaymentProviders.IYZICO
        ? this.iyzicoLink
        : this.stripeLink;
    const amount =
      bp.paidProvider === PaymentProviders.IYZICO
        ? bp.tryAmount.amount.toNumber()
        : bp.saleAmount.amount.toNumber();
    const currency =
      bp.paidProvider === PaymentProviders.IYZICO
        ? Currency.enum.TRY
        : bp.saleCurrency.value;

    await adapter.refund({
      providerRef: bp.paidProviderRef,
      amount,
      currency,
      reason,
    });

    bp.markRefunded(reason ?? 'Rezervasyon iptal edildi.');
    await this.bookingPaymentCommandRepo.save(bp);
    this.logger.log(
      `İade tamamlandı (bp=${bp.id.value}, provider=${bp.paidProvider}, amount=${amount} ${currency}).`
    );
  }
}
