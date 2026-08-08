import { ConfirmBookingPaymentHandler } from './confirm-booking-payment.handler';
import { ConfirmBookingPaymentCommand } from './confirm-booking-payment.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { IPaymentLinkProvider } from '@src/infrastructure/payment/links/payment-link.port';
import { IBookingPaymentCommandRepository } from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment/booking-payment.command.repository';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import { BookingPaymentNotFoundException } from '@modules/crm/health-tourism/booking-payment/domain/exceptions/booking-payment.exceptions';
import {
  CreateBookingPaymentProps,
  HotelBookingIntent,
} from '@modules/crm/health-tourism/booking-payment/domain/contracts/booking-payment.contracts';
import { BookHotelCommand } from '@modules/crm/health-tourism/hotel/application/commands/book-hotel/book-hotel.command';
import { NATS_SUBJECTS } from '@src/transport';
import { IGetContext } from '@common/decorators';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';

describe('ConfirmBookingPaymentHandler — saga (book replay / iade)', () => {
  // Entity.create UUID VO doğrulaması yaptığından fixture id'leri geçerli UUID olmalı.
  const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
  const ORG_ID = '22222222-2222-4222-8222-222222222222';
  const PATIENT_ID = '33333333-3333-4333-8333-333333333333';
  const LEAD_ID = '44444444-4444-4444-8444-444444444444';

  const ctx: IGetContext = {
    actor: {
      userId: 'user-1',
      clinicId: CLINIC_ID,
      organizationId: ORG_ID,
      managedClinics: [{ id: CLINIC_ID }],
    } as IGetContext['actor'],
    source: ExecutionSources.USER_ACTION,
  };

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
      execute: jest.fn(async (_cmd: unknown) => {
        // book komutları + onay bildirimi
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

    const commandRepo = {
      findById: jest.fn(async () => bp),
      update: jest.fn(async (e: BookingPayment) => e),
    } as unknown as IBookingPaymentCommandRepository;

    const natsClient = {
      emit: jest.fn(() => ({ subscribe: jest.fn() })),
    } as any;

    const policyFactory = {
      clinic: jest.fn().mockReturnValue({
        evaluator: {
          check: jest.fn().mockReturnValue({
            orThrow: () => undefined,
          }),
        },
      }),
    } as any;

    // Platform defteri: tahsilat kliniğe değil buraya postlanır.
    const platformTenant = {
      resolve: jest.fn().mockResolvedValue({
        clinicId: 'platform-clinic',
        organizationId: 'platform-org',
      }),
    } as any;

    return {
      handler: new ConfirmBookingPaymentHandler(
        commandBus,
        iyzicoLink,
        stripeLink,
        commandRepo,
        policyFactory,
        natsClient,
        platformTenant
      ),
      platformTenant,
      commandBus,
      iyzicoLink,
      stripeLink,
      commandRepo,
      policyFactory,
      natsClient,
    };
  };

  it('PENDING + Stripe ödeme → PAID → book → BOOKED; diğer link (iyzico) expire edilir', async () => {
    const bp = makeBp('PENDING');
    const { handler, commandBus, iyzicoLink, natsClient } = build(bp);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'STRIPE',
        providerRef: 'pi_1',
              ctx,
      })
    );

    expect(bp.status).toBe('BOOKED');
    expect(bp.bookingReference).toBe('BK-1');
    const calls = (commandBus.execute as jest.Mock).mock.calls.map((c) => c[0]);
    // book + müşteri onay bildirimi (misafir → muhasebe atlanır)
    expect(calls.some((c) => c instanceof BookHotelCommand)).toBe(true);
    // Onay bildirimi artık komut değil olay: messaging ayrı serviste.
    expect(natsClient.emit).toHaveBeenCalledWith(
      NATS_SUBJECTS.booking.confirmed,
      expect.objectContaining({ clinicId: CLINIC_ID })
    );
    expect(iyzicoLink.expireLink).toHaveBeenCalledWith(bp.id.value);
  });

  it('hastalı rezervasyonda bile tahsilat KLİNİK defterine yazılmaz: platform defterine yazılır', async () => {
    const bp = makeBp('PENDING', PATIENT_ID);
    const { handler, commandBus, natsClient } = build(bp);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'STRIPE',
        providerRef: 'pi_1',
              ctx,
      })
    );

    expect(bp.status).toBe('BOOKED');
    const commands = (commandBus.execute as jest.Mock).mock.calls.map(
      (c) => c[0]
    );
    const dispatched = commands.map((c) => (c as object).constructor.name);

    // Klinik cari hesabı açılmaz — klinik bu işleme finansal olarak taraf değil.
    expect(dispatched).not.toContain('EnsurePartyForPatientCommand');

    const financialEvent = commands.find(
      (c) => (c as object).constructor.name === 'RecordFinancialEventCommand'
    ) as { data: { clinicId: string; type: string } };

    // Olay yazılır ama defter sahibi PLATFORM'dur; rezervasyonun kliniği DEĞİL.
    expect(financialEvent).toBeDefined();
    expect(financialEvent.data.clinicId).toBe('platform-clinic');
    expect(financialEvent.data.clinicId).not.toBe(CLINIC_ID);
    expect(financialEvent.data.type).toBe('PLATFORM_BOOKING_SETTLED');

    expect(dispatched).toEqual(expect.arrayContaining(['BookHotelCommand']));
    expect(natsClient.emit).toHaveBeenCalledWith(
      NATS_SUBJECTS.booking.confirmed,
      expect.objectContaining({ clinicId: CLINIC_ID })
    );
  });

  it('komisyon = brüt − tedarikçi payı; hasılat yalnız komisyon olacak şekilde yazılır', async () => {
    const bp = makeBp('PENDING', PATIENT_ID);
    const { handler, commandBus } = build(bp);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'STRIPE',
        providerRef: 'pi_1',
        ctx,
      })
    );

    const event = (commandBus.execute as jest.Mock).mock.calls
      .map((c) => c[0])
      .find(
        (c) => (c as object).constructor.name === 'RecordFinancialEventCommand'
      ) as { data: { payload: Record<string, string>; dedupeKey?: string } };

    const { saleAmount, supplierAmount, commission } = event.data.payload;
    expect(Number(commission)).toBeCloseTo(
      Number(saleAmount) - Number(supplierAmount),
      2
    );
  });

  it('muhasebe kaydı düşse bile rezervasyon bozulmaz (tahsilat alınmış, otel açılmış)', async () => {
    const bp = makeBp('PENDING', PATIENT_ID);
    const { handler, platformTenant } = build(bp);
    platformTenant.resolve.mockRejectedValue(
      new Error('platform kiracısı yok')
    );

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'STRIPE',
        providerRef: 'pi_1',
        ctx,
      })
    );

    // Kayıt atılamadı ama rezervasyon ayakta; iade akışına DÜŞMEZ.
    expect(bp.status).toBe('BOOKED');
  });

  it('çift-çekim: zaten BOOKED kayda ikinci ödeme → ikinci ödeme iade, rebook YOK', async () => {
    const bp = makeBp('BOOKED');
    const { handler, commandBus, iyzicoLink } = build(bp);

    await handler.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId: bp.id.value,
        provider: 'IYZICO',
        providerRef: 'tx_2',
              ctx,
      })
    );

    expect(iyzicoLink.refund).toHaveBeenCalledWith(
      expect.objectContaining({
        providerRef: 'tx_2',
        currency: 'TRY',
        amount: 4200,
      })
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
              ctx,
      })
    );

    expect(stripeLink.refund).toHaveBeenCalledWith(
      expect.objectContaining({
        providerRef: 'pi_1',
        currency: 'EUR',
        amount: 120,
      })
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
                  ctx,
        })
      )
    ).rejects.toBeInstanceOf(BookingPaymentNotFoundException);
  });
});
