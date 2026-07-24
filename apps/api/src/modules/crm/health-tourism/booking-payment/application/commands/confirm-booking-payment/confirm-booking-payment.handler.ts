import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { IGetContext } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { SYSTEM_ACTOR } from '@common/constants/system-actor.constant';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';
import {
  IPaymentLinkProvider,
  IYZICO_PAYMENT_LINK,
  STRIPE_PAYMENT_LINK,
} from '@src/infrastructure/payment/links/payment-link.port';
import {
  BOOKING_PAYMENT_COMMAND_REPOSITORY,
  IBookingPaymentCommandRepository,
} from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment.repository';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import {
  BookingPaymentProviderValue,
  HotelBookingIntent,
  TransferBookingIntent,
} from '@modules/crm/health-tourism/booking-payment/domain/contracts/booking-payment.contracts';
import { BookingPaymentNotFoundException } from '@modules/crm/health-tourism/booking-payment/domain/exceptions/booking-payment.exceptions';
import { BookHotelCommand } from '@modules/crm/health-tourism/hotel/application/commands/book-hotel/book-hotel.command';
import { BookTransferCommand } from '@modules/crm/health-tourism/transfer/application/commands/book-transfer/book-transfer.command';
import {
  BookHotelDto,
  BookTransferDto,
} from '@shared/modules/health-tourism/dto/commands';
import { SendBookingConfirmationCommand } from '@modules/messaging/ai-agent/application/commands/send-booking-confirmation/send-booking-confirmation.command';
import { ConfirmBookingPaymentCommand } from './confirm-booking-payment.command';
import { PaymentProviders } from '@common/constants';
import { CurrencySchema } from '@input-type-schemas/CurrencySchema';
import { Currency } from '@src/domain/value-objects/currency.vo';
import { BookingPaymentTypeSchema } from '@shared';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(ConfirmBookingPaymentCommand)
export class ConfirmBookingPaymentHandler
  implements ICommandHandler<ConfirmBookingPaymentCommand, void>
{
  private readonly logger = new Logger(ConfirmBookingPaymentHandler.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    @Inject(IYZICO_PAYMENT_LINK)
    private readonly iyzicoLink: IPaymentLinkProvider,
    @Inject(STRIPE_PAYMENT_LINK)
    private readonly stripeLink: IPaymentLinkProvider,
    @Inject(BOOKING_PAYMENT_COMMAND_REPOSITORY)
    private readonly bookingPaymentCommandRepo: IBookingPaymentCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: ConfirmBookingPaymentCommand): Promise<void> {
    const { bookingPaymentId, provider, providerRef, ctx } = command.input;

    const bp = await this.bookingPaymentCommandRepo.findById(bookingPaymentId);
    if (!bp) {
      throw new BookingPaymentNotFoundException(
        `Ödeme kaydı bulunamadı: ${bookingPaymentId}`
      );
    }

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(bp.clinicId.value))
      .orThrow();

    // Idempotency: PENDING değilse tekrar işlenmez. Zaten ödenmiş bir kayda ikinci ödeme
    // gelirse (iki link de ödendi) → çift-çekim → ikinci ödemeyi iade et.
    if (!bp.validate.status.isPending.value) {
      if (bp.validate.status.isSettled.value) {
        this.logger.warn(
          `Çift ödeme tespit edildi (bp=${bookingPaymentId}, provider=${provider}). İkinci ödeme iade ediliyor.`
        );
        await this.refundCharge(provider, providerRef, bp);
      }
      return;
    }

    // PENDING → PAID
    bp.markPaid(provider, providerRef);
    await this.bookingPaymentCommandRepo.save(bp);

    // Diğer linki geçersiz kıl (best-effort).
    await this.expireOtherLink(provider, bp);

    // intent'i HotelBeds'e replay et.
    try {
      const bookingId = await this.book(bp);
      bp.markBooked(bookingId, bookingId);
      await this.bookingPaymentCommandRepo.save(bp);
      this.logger.log(
        `Rezervasyon tamamlandı (bp=${bookingPaymentId}, bookingId=${bookingId}).`
      );
      // NOT: Tahsilat kliniğin finans defterine YAZILMAZ. Otel/transfer bir platform işlemidir
      // (hasta platform hesabına öder, platform HotelBeds'e öder); komisyon platform geliridir.
      // Klinik bu işleme finansal olarak taraf değildir. Platform-gelir defteri ayrı ele alınacak.
      // Müşteriye mesajlaşma kanalından onay (AI dilinde / pencere dışı HSM); hatası bozmaz.
      await this.notifyCustomer(bp);
    } catch (err) {
      const reason =
        err instanceof Error ? err.message : 'Rezervasyon başarısız';
      this.logger.error(
        `HotelBeds rezervasyonu başarısız (bp=${bookingPaymentId}): ${reason}`
      );
      bp.markFailed(reason);
      await this.bookingPaymentCommandRepo.save(bp);
      // Tahsil edildi ama rezervasyon açılamadı → ödemeyi iade et.
      try {
        await this.refundCharge(provider, providerRef, bp);
        bp.markRefunded(reason);
        await this.bookingPaymentCommandRepo.save(bp);
      } catch (refundErr) {
        // TODO: slack bildirimi yollanacak
        this.logger.error(
          `İade de başarısız (bp=${bookingPaymentId}); manuel müdahale gerekli: ${
            refundErr instanceof Error ? refundErr.message : refundErr
          }`
        );
      }
    }
  }

  /**
   * Müşteriye rezervasyon onayını mesajlaşma kanalından bildirir (cross-module → messaging).
   * Konuşma bağlamı yoksa (conversationId null) atlanır; hata booking'i bozmaz.
   */
  private async notifyCustomer(bp: BookingPayment): Promise<void> {
    if (!bp.conversationId) return;
    try {
      await this.commandBus.execute(
        new SendBookingConfirmationCommand({
          clinicId: bp.clinicId.value,
          conversationId: bp.conversationId,
          bookingType: bp.bookingType,
          reference: bp.bookingReference ?? bp.bookingId ?? bp.id.value,
          summary: this.buildSummary(bp),
        })
      );
    } catch (err) {
      this.logger.warn(
        `Onay mesajı gönderilemedi (bp=${bp.id.value}): ${
          err instanceof Error ? err.message : err
        }`
      );
    }
  }

  private buildSummary(bp: BookingPayment): string {
    const intent = bp.bookingIntent;
    return intent.type === BookingPaymentTypeSchema.enum.HOTEL
      ? `${intent.hotelName} (${intent.checkIn} → ${intent.checkOut})`
      : `${intent.vehicleName} transferi`;
  }

  /** intent'e göre BookHotel/BookTransfer dispatch eder; dönen dahili rezervasyon id'sini verir. */
  private async book(bp: BookingPayment): Promise<string> {
    const ctx = this.buildSystemContext(bp);
    const intent = bp.bookingIntent;

    if (intent.type === BookingPaymentTypeSchema.enum.HOTEL) {
      return this.commandBus.execute(
        new BookHotelCommand(this.toHotelDto(intent, bp), ctx)
      );
    }
    return this.commandBus.execute(
      new BookTransferCommand(this.toTransferDto(intent, bp), ctx)
    );
  }

  private toHotelDto(
    intent: HotelBookingIntent,
    bp: BookingPayment
  ): BookHotelDto {
    return {
      hotelCode: intent.hotelCode,
      checkIn: DateTimeManager.create(intent.checkIn),
      checkOut: DateTimeManager.create(intent.checkOut),
      holderName: intent.holderName,
      holderSurname: intent.holderSurname,
      rooms: intent.rooms,
      remarks: intent.remarks,
      patientId: bp.patientId?.value ?? undefined,
      leadId: bp.leadId?.value ?? undefined,
    } as BookHotelDto;
  }

  private toTransferDto(
    intent: TransferBookingIntent,
    bp: BookingPayment
  ): BookTransferDto {
    return {
      language: intent.language,
      holderName: intent.holderName,
      holderSurname: intent.holderSurname,
      holderEmail: intent.holderEmail,
      holderPhone: intent.holderPhone,
      transfers: intent.transfers,
      patientId: bp.patientId?.value ?? undefined,
      leadId: bp.leadId?.value ?? undefined,
      clinicId: bp.clinicId.value,
    } as BookTransferDto;
  }

  /** Ödenen sağlayıcının dışındaki linki geçersiz kılar (Stripe expire; iyzico no-op). */
  private async expireOtherLink(
    paidProvider: BookingPaymentProviderValue,
    bp: BookingPayment
  ): Promise<void> {
    try {
      if (paidProvider === PaymentProviders.IYZICO && bp.stripeSessionId) {
        await this.stripeLink.expireLink(bp.stripeSessionId);
      } else if (
        paidProvider === PaymentProviders.STRIPE &&
        bp.iyzicoConversationId
      ) {
        await this.iyzicoLink.expireLink(bp.iyzicoConversationId);
      }
    } catch (err) {
      this.logger.warn(
        `Diğer link expire edilemedi (bp=${bp.id.value}): ${
          err instanceof Error ? err.message : err
        }`
      );
    }
  }

  /** Belirtilen sağlayıcı ödemesini iade eder (durum değiştirmez — çağıran karar verir). */
  private async refundCharge(
    provider: BookingPaymentProviderValue,
    providerRef: string,
    bp: BookingPayment
  ): Promise<void> {
    const adapter =
      provider === PaymentProviders.IYZICO ? this.iyzicoLink : this.stripeLink;
    const amount =
      provider === PaymentProviders.IYZICO
        ? bp.tryAmount.value.toNumber()
        : bp.saleAmount.value.toNumber();
    const currency =
      provider === PaymentProviders.IYZICO
        ? Currency.fromTrusted(CurrencySchema.enum.TRY).value
        : bp.saleCurrency.value;
    await adapter.refund({ providerRef, amount, currency });
  }

  /** Webhook'ta actor yok → klinik-kapsamlı sistem context'i kurar (bus dispatch için). */
  private buildSystemContext(bp: BookingPayment): IGetContext {
    const actor: ActorContext = {
      ...SYSTEM_ACTOR,
      clinicId: bp.clinicId.value,
      organizationId: bp.organizationId.value,
      managedClinics: [{ id: bp.clinicId.value }],
    };
    return {
      actor,
      source: ExecutionSources.INTERNAL_CASCADE,
      ip: '127.0.0.1',
      userAgent: 'BOOKING_PAYMENT_WEBHOOK',
    };
  }
}
