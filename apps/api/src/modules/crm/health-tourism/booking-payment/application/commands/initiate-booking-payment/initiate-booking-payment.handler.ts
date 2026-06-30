import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import {
  IPaymentLinkProvider,
  IYZICO_PAYMENT_LINK,
  STRIPE_PAYMENT_LINK,
} from '@src/infrastructure/payment/links/payment-link.port';
import {
  FX_RATE_PROVIDER,
  IFxRateProvider,
} from '@src/infrastructure/payment/links/fx-rate.port';
import {
  BOOKING_PAYMENT_COMMAND_REPOSITORY,
  IBookingPaymentCommandRepository,
} from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment.repository';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import {
  BookingIntent,
  BookingPaymentLinks,
} from '@modules/crm/health-tourism/booking-payment/domain/booking-payment.contracts';
import { BookingPaymentLinkGenerationException } from '@modules/crm/health-tourism/booking-payment/domain/exceptions/booking-payment.exceptions';
import { InitiateBookingPaymentCommand } from './initiate-booking-payment.command';
import {
  BookingPaymentLinkOption,
  InitiateBookingPaymentResponse,
} from './initiate-booking-payment.response';

@CommandHandler(InitiateBookingPaymentCommand)
export class InitiateBookingPaymentHandler
  implements
    ICommandHandler<
      InitiateBookingPaymentCommand,
      InitiateBookingPaymentResponse
    >
{
  private readonly logger = new Logger(InitiateBookingPaymentHandler.name);

  constructor(
    @Inject(IYZICO_PAYMENT_LINK)
    private readonly iyzicoLink: IPaymentLinkProvider,
    @Inject(STRIPE_PAYMENT_LINK)
    private readonly stripeLink: IPaymentLinkProvider,
    @Inject(FX_RATE_PROVIDER)
    private readonly fx: IFxRateProvider,
    @Inject(BOOKING_PAYMENT_COMMAND_REPOSITORY)
    private readonly repo: IBookingPaymentCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: InitiateBookingPaymentCommand
  ): Promise<InitiateBookingPaymentResponse> {
    const { input } = command;

    const saleCurrency = input.netCurrency;
    const fee = input.serviceFeePercent > 0 ? input.serviceFeePercent : 0;
    const saleAmount = this.round2(input.netAmount * (1 + fee / 100));

    // FX → TRY (iyzico). Çözülemezse iyzico linki atlanır, Stripe yine üretilir.
    let fxRate: number | null = null;
    let tryAmount = saleAmount;
    try {
      fxRate = await this.fx.getRate(saleCurrency, 'TRY');
      tryAmount = this.round2(saleAmount * fxRate);
    } catch (err) {
      this.logger.warn(
        `FX kuru çözülemedi (${saleCurrency}→TRY): ${
          err instanceof Error ? err.message : err
        } — iyzico linki atlanacak.`
      );
    }

    const id = randomUUID();
    const description = this.buildDescription(input.intent);
    const links: BookingPaymentLinks = {};
    let iyzicoOption: BookingPaymentLinkOption | null = null;
    let stripeOption: BookingPaymentLinkOption | null = null;

    // iyzico — TRY (yurt içi). Yalnız FX çözülebildiyse.
    if (fxRate !== null) {
      try {
        const r = await this.iyzicoLink.createLink({
          bookingPaymentId: id,
          amount: tryAmount,
          currency: 'TRY',
          description,
          buyer: input.buyer,
          ip: input.ip,
        });
        links.iyzicoConversationId = r.sessionId;
        links.iyzicoToken = r.token ?? null;
        links.iyzicoUrl = r.url;
        iyzicoOption = { url: r.url, amount: tryAmount, currency: 'TRY' };
      } catch (err) {
        this.logger.warn(
          `iyzico linki üretilemedi: ${err instanceof Error ? err.message : err}`
        );
      }
    }

    // Stripe — EUR/USD (yurt dışı). Satış TRY ise atlanır.
    if (saleCurrency !== 'TRY') {
      try {
        const r = await this.stripeLink.createLink({
          bookingPaymentId: id,
          amount: saleAmount,
          currency: saleCurrency,
          description,
          buyer: input.buyer,
          ip: input.ip,
        });
        links.stripeSessionId = r.sessionId;
        links.stripeUrl = r.url;
        stripeOption = { url: r.url, amount: saleAmount, currency: saleCurrency };
      } catch (err) {
        this.logger.warn(
          `Stripe linki üretilemedi: ${err instanceof Error ? err.message : err}`
        );
      }
    }

    if (!iyzicoOption && !stripeOption) {
      throw new BookingPaymentLinkGenerationException();
    }

    const entity = BookingPayment.create({
      id,
      bookingType: input.bookingType,
      saleCurrency,
      saleAmount,
      tryAmount,
      netAmount: input.netAmount,
      fxRate,
      intent: input.intent,
      clinicId: input.clinicId,
      organizationId: input.organizationId,
      patientId: input.patientId,
      leadId: input.leadId,
      conversationId: input.conversationId,
    });
    entity.attachLinks(links);

    await this.txManager.run(async () => {
      await this.repo.save(entity);
    });

    return {
      bookingPaymentId: id,
      saleAmount,
      saleCurrency,
      iyzico: iyzicoOption,
      stripe: stripeOption,
    };
  }

  private buildDescription(intent: BookingIntent): string {
    return intent.type === 'HOTEL'
      ? `Otel rezervasyonu — ${intent.hotelName}`
      : `Havalimanı transferi — ${intent.vehicleName}`;
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
