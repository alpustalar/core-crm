import { ConfirmBookingPaymentHandler } from './confirm-booking-payment.handler';
import { ConfirmBookingPaymentCommand } from './confirm-booking-payment.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { IPaymentLinkProvider } from '@src/infrastructure/payment/links/payment-link.port';
import {
  IBookingPaymentCommandRepository,
  IBookingPaymentQueryRepository,
} from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment.repository';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import { BookingPaymentNotFoundException } from '@modules/crm/health-tourism/booking-payment/domain/exceptions/booking-payment.exceptions';
import {
  CreateBookingPaymentProps,
  HotelBookingIntent,
} from '@modules/crm/health-tourism/booking-payment/domain/booking-payment.contracts';
import { BookHotelCommand } from '@modules/crm/health-tourism/hotel/application/commands/book-hotel/book-hotel.command';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import { SendBookingConfirmationCommand } from '@modules/messaging/ai-agent/application/commands/send-booking-confirmation/send-booking-confirmation.command';

describe('ConfirmBookingPaymentHandler — saga (book replay / iade)', () => {
  // Entity.create UUID VO doğrulaması yaptığından fixture id'leri geçerli UUID olmalı.
  const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
  const ORG_ID = '22222222-2222-4222-8222-222222222222';
  const PATIENT_ID = '33333333-3333-4333-8333-333333333333';
  const LEAD_ID = '44444444-4444-4444-8444-444444444444';

  const hotelIntent: HotelBookingIntent = {
    type: 'HOTEL',
    hotelCode: 'H1',
    hotelName: 'Otel Bir',
    checkIn: '2026-07-01',
    checkOut: '2026-07-05',
    holderName: 'Ali',
    holderSurname: 'Veli',
    rooms: [{ rateKey: 'RK-1', paxes: [] }],
  };

  const props: CreateBookingPaymentProps = {
    bookingType: 'HOTEL',
    saleCurrency: 'EUR',
    saleAmount: 120,
    tryAmount: 4200,
    netAmount: 100,
    fxRate: 35,
    intent: hotelIntent,
    clinicId: CLINIC_ID,
    organizationId: ORG_ID,
    patientId: null,
    leadId: LEAD_ID,
    conversationId: 'conv-1',
  };

  const makeBp = (
    state: 'PENDING' | 'BOOKED',
    patientId: string | null = null
  ): BookingPayment => {
    const bp = BookingPayment.create({ ...props, patientId });
    bp.attachLinks({
      iyzicoConversationId: bp.id.value,
      iyzicoUrl: 'https://iyzi',
      stripeSessionId: 'cs_1',
      stripeUrl: 'https://stripe',
    });
    if (state === 'BOOKED') {
      bp.markPaid('STRIPE', 'pi_first');
      bp.markBooked('BK-prev', 'BK-prev');
    }
    return bp;
  };

  const build = (bp: BookingPayment | null, bookThrows = false) => {
    const commandBus = {
      execute: jest.fn(async (cmd: unknown) => {
        if (cmd instanceof EnsurePartyForPatientCommand) {
          return { partyId: 'party-1', organizationId: 'org-1' };
        }
        if (cmd instanceof RecordFinancialEventCommand) {
          return 'evt-1';
        }
        // book komutları
        if (bookThrows) throw new Error('rate expired');
        return 'BK-1';
      }),
    } as unknown as TSCommandBus;

    const iyzicoLink = {
      provider: 'IYZICO',
      createLink: jest.fn(),
      expireLink: jest.fn(),
      refund: jest.fn(),
    } as unknown as IPaymentLinkProvider;

    const stripeLink = {
      provider: 'STRIPE',
      createLink: jest.fn(),
      expireLink: jest.fn(),
      refund: jest.fn(),
    } as unknown as IPaymentLinkProvider;

    const queryRepo = {
      findById: jest.fn(async () => bp),
    } as unknown as IBookingPaymentQueryRepository;

    const commandRepo = {
      save: jest.fn(async (e: BookingPayment) => e),
    } as unknown as IBookingPaymentCommandRepository;

    return {
      handler: new ConfirmBookingPaymentHandler(
        commandBus,
        iyzicoLink,
        stripeLink,
        queryRepo,
        commandRepo
      ),
      commandBus,
      iyzicoLink,
      stripeLink,
      commandRepo,
    };
  };

  it('PENDING + Stripe ödeme → PAID → book → BOOKED; diğer link (iyzico) expire edilir', async () => {
    const bp = makeBp('PENDING');
    const { handler, commandBus, iyzicoLink } = build(bp);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'STRIPE',
        providerRef: 'pi_1',
      })
    );

    expect(bp.status).toBe('BOOKED');
    expect(bp.bookingReference).toBe('BK-1');
    const calls = (commandBus.execute as jest.Mock).mock.calls.map((c) => c[0]);
    // book + müşteri onay bildirimi (misafir → muhasebe atlanır)
    expect(calls.some((c) => c instanceof BookHotelCommand)).toBe(true);
    expect(
      calls.some((c) => c instanceof SendBookingConfirmationCommand)
    ).toBe(true);
    expect(iyzicoLink.expireLink).toHaveBeenCalledWith(bp.id.value);
  });

  it('hastalı Stripe (yurtdışı) rezervasyon → PAYMENT_RECEIVED köprüsü orijinal döviz (saleAmount EUR + currency) yazar; posting çevirir', async () => {
    const bp = makeBp('PENDING', PATIENT_ID);
    const { handler, commandBus } = build(bp);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'STRIPE',
        providerRef: 'pi_1',
      })
    );

    expect(bp.status).toBe('BOOKED');
    const calls = (commandBus.execute as jest.Mock).mock.calls.map((c) => c[0]);
    const ensure = calls.find(
      (c) => c instanceof EnsurePartyForPatientCommand
    ) as EnsurePartyForPatientCommand;
    const record = calls.find(
      (c) => c instanceof RecordFinancialEventCommand
    ) as RecordFinancialEventCommand;

    expect(ensure?.patientId).toBe(PATIENT_ID);
    // Stripe döviz tahsilatı: orijinal saleAmount (120) + saleCurrency (EUR) yazılır;
    // fonksiyonel paraya çevirmeyi posting handler yapar (Model A).
    expect(record?.input.type).toBe('PAYMENT_RECEIVED');
    expect(record?.input.payload).toMatchObject({
      method: 'POS_CARD',
      amount: '120',
      partyId: 'party-1',
      currency: 'EUR',
    });
    expect(record?.input.dedupeKey).toBe(
      `booking-payment-received:${bp.id.value}`
    );
  });

  it('hastalı iyzico (yurtiçi) rezervasyon → PAYMENT_RECEIVED köprüsü tryAmount TRY yazar, currency verilmez (çevrim yok)', async () => {
    const bp = makeBp('PENDING', PATIENT_ID);
    const { handler, commandBus } = build(bp);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'IYZICO',
        providerRef: 'tx_1',
      })
    );

    expect(bp.status).toBe('BOOKED');
    const calls = (commandBus.execute as jest.Mock).mock.calls.map((c) => c[0]);
    const record = calls.find(
      (c) => c instanceof RecordFinancialEventCommand
    ) as RecordFinancialEventCommand;

    // iyzico yurtiçi TRY: tryAmount (4200); currency yok → posting fonksiyonel para varsayar.
    expect(record?.input.payload).toMatchObject({
      method: 'POS_CARD',
      amount: '4200',
      partyId: 'party-1',
    });
    expect(
      (record?.input.payload as Record<string, unknown>).currency
    ).toBeUndefined();
  });

  it('çift-çekim: zaten BOOKED kayda ikinci ödeme → ikinci ödeme iade, rebook YOK', async () => {
    const bp = makeBp('BOOKED');
    const { handler, commandBus, iyzicoLink } = build(bp);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'IYZICO',
        providerRef: 'tx_2',
      })
    );

    expect(iyzicoLink.refund).toHaveBeenCalledWith(
      expect.objectContaining({ providerRef: 'tx_2', currency: 'TRY', amount: 4200 })
    );
    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(bp.status).toBe('BOOKED');
  });

  it('book başarısız → FAILED → ödeme iade → REFUNDED', async () => {
    const bp = makeBp('PENDING');
    const { handler, stripeLink } = build(bp, true);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'STRIPE',
        providerRef: 'pi_1',
      })
    );

    expect(stripeLink.refund).toHaveBeenCalledWith(
      expect.objectContaining({ providerRef: 'pi_1', currency: 'EUR', amount: 120 })
    );
    expect(bp.status).toBe('REFUNDED');
  });

  it('kayıt yoksa BookingPaymentNotFoundException', async () => {
    const { handler } = build(null);
    await expect(
      handler.execute(
        new ConfirmBookingPaymentCommand({
          bookingPaymentId: 'yok',
          provider: 'STRIPE',
          providerRef: 'pi_1',
        })
      )
    ).rejects.toBeInstanceOf(BookingPaymentNotFoundException);
  });
});
