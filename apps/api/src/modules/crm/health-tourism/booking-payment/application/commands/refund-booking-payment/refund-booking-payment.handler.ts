import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  IPaymentLinkProvider,
  IYZICO_PAYMENT_LINK,
  STRIPE_PAYMENT_LINK,
} from '@src/infrastructure/payment/links/payment-link.port';
import { RefundBookingPaymentCommand } from './refund-booking-payment.command';
import { PaymentProviders } from '@common/constants';
import { Currency } from '@src/domain/value-objects/currency.vo';
import {
  BOOKING_PAYMENT_COMMAND_REPOSITORY,
  IBookingPaymentCommandRepository,
} from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment/booking-payment.command.repository';
import BookingPaymentStatusSchema from '@input-type-schemas/BookingPaymentStatusSchema';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { BookingPaymentProviderValue } from '@modules/crm/health-tourism/booking-payment/domain/contracts/booking-payment.contracts';

/** Kilitli claim'in çıktısı: iade için gereken, artık null olmadığı kesin alanlar. */
interface RefundClaim {
  readonly bp: BookingPayment;
  readonly provider: BookingPaymentProviderValue;
  readonly providerRef: string;
}

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
    @Inject(BOOKING_PAYMENT_COMMAND_REPOSITORY)
    private readonly bookingPaymentRepo: IBookingPaymentCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  /**
   * Önce **kilitli claim** (BOOKED→REFUNDED), sonra sağlayıcıya iade çağrısı.
   *
   * Sıra bilinçli: iki eşzamanlı iptal isteği kilitsiz okusaydı ikisi de "BOOKED"
   * görüp sağlayıcıya iki kez iade gönderirdi — para iki kez çıkar. Claim önce
   * yazıldığı için ikinci istek REFUNDED görüp atlar. Ters risk (durum REFUNDED
   * ama sağlayıcı çağrısı düştü) para kaybettirmez, loglanıp elle tamamlanır.
   */
  async execute(command: RefundBookingPaymentCommand): Promise<void> {
    const { bookingId, reason } = command;

    const claim = await this.claimForRefund(bookingId, reason);
    if (!claim) return;

    const { bp, provider, providerRef } = claim;

    // v1: tam satış tutarı iade (HotelBeds iptal cezası mahsubu sonraki iterasyon).
    const isIyzico = provider === PaymentProviders.IYZICO;
    const adapter = isIyzico ? this.iyzicoLink : this.stripeLink;
    const amount = isIyzico
      ? bp.tryAmount.value.toNumber()
      : bp.saleAmount.value.toNumber();
    const currency = isIyzico ? Currency.enum.TRY : bp.saleCurrency.value;

    try {
      await adapter.refund({ providerRef, amount, currency, reason });
    } catch (err) {
      // Kayıt REFUNDED olarak mühürlendi ama para geri gitmedi → elle tamamlanmalı.
      // Durumu geri almıyoruz: geri alsak yeniden deneme mükerrer iade riskine açılır
      // (çağrı zaman aşımına uğradıysa sağlayıcıda başarılı olmuş olabilir).
      this.logger.error(
        `İade çağrısı başarısız (bp=${bp.id.value}, provider=${provider}); kayıt REFUNDED, manuel müdahale gerekli: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      throw err;
    }

    this.logger.log(
      `İade tamamlandı (bp=${bp.id.value}, provider=${provider}, amount=${amount} ${currency}).`
    );
  }

  /**
   * Kaydı kilitleyip iadeyi sahiplenir. İade edilebilir durumda değilse (kayıt yok,
   * BOOKED değil, ödeme referansı yok) `null` döner ve akış sessizce atlanır.
   */
  private async claimForRefund(
    bookingId: string,
    reason?: string
  ): Promise<RefundClaim | null> {
    return this.txManager.run(async () => {
      const bp =
        await this.bookingPaymentRepo.findByBookingIdForUpdate(bookingId);

      // B7 öncesi/ödemesiz rezervasyonda kayıt olmayabilir → iptal akışını bozmadan geç.
      if (!bp) {
        this.logger.warn(
          `İade için ödeme kaydı bulunamadı (bookingId=${bookingId}); atlandı.`
        );
        return null;
      }

      if (bp.status !== BookingPaymentStatusSchema.enum.BOOKED) {
        this.logger.warn(
          `İade atlandı (bp=${bp.id.value}); durum BOOKED değil (mevcut: ${bp.status}).`
        );
        return null;
      }

      const provider = bp.paidProvider;
      const providerRef = bp.paidProviderRef;
      if (!provider || !providerRef) {
        this.logger.warn(
          `İade atlandı (bp=${bp.id.value}); ödeme referansı yok.`
        );
        return null;
      }

      bp.markRefunded(reason ?? 'Rezervasyon iptal edildi.');
      return {
        bp: await this.bookingPaymentRepo.update(bp),
        provider,
        providerRef,
      };
    });
  }
}
