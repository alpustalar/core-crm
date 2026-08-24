import { InitiateBookingPaymentHandler } from './initiate-booking-payment.handler';
import {
  InitiateBookingPaymentCommand,
  InitiateBookingPaymentInput,
} from './initiate-booking-payment.command';
import { IPaymentLinkProvider } from '@src/infrastructure/payment/links/payment-link.port';
import { IFxRateProvider } from '@src/infrastructure/payment/links/fx-rate.port';
import { IServiceFeeProvider } from '@src/infrastructure/payment/links/service-fee.port';
import { IBookingPaymentCommandRepository } from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment/booking-payment.command.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import { HotelBookingIntent } from '@modules/crm/health-tourism/booking-payment/domain/contracts/booking-payment';

describe('InitiateBookingPaymentHandler — iki link + FX', () => {
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

  const baseInput: InitiateBookingPaymentInput = {
    bookingType: 'HOTEL',
    intent: hotelIntent,
    netAmount: 100,
    netCurrency: 'EUR',
    buyer: { name: 'Ali', surname: 'Veli', email: '', phone: '+90555' },
    clinicId: '11111111-1111-4111-8111-111111111111',
    organizationId: '22222222-2222-4222-8222-222222222222',
    patientId: null,
    leadId: '33333333-3333-4333-8333-333333333333',
    conversationId: 'conv-1',
    ip: '127.0.0.1',
  };

  const build = (opts?: {
    fxRate?: number;
    fxThrows?: boolean;
    iyzicoThrows?: boolean;
    stripeThrows?: boolean;
    serviceFeePercent?: number;
  }) => {
    const saved: BookingPayment[] = [];

    const iyzicoLink = {
      provider: 'IYZICO',
      createLink: jest.fn(async () => {
        if (opts?.iyzicoThrows) throw new Error('iyzico down');
        return {
          provider: 'IYZICO' as const,
          sessionId: 'conv-1',
          token: 'tok',
          url: 'https://iyzi/pay',
        };
      }),
      expireLink: jest.fn(),
      refund: jest.fn(),
    } as unknown as IPaymentLinkProvider;

    const stripeLink = {
      provider: 'STRIPE',
      createLink: jest.fn(async () => {
        if (opts?.stripeThrows) throw new Error('stripe down');
        return {
          provider: 'STRIPE' as const,
          sessionId: 'cs_1',
          url: 'https://stripe/pay',
        };
      }),
      expireLink: jest.fn(),
      refund: jest.fn(),
    } as unknown as IPaymentLinkProvider;

    const fx = {
      getRate: jest.fn(async (from: string, to: string) => {
        if (opts?.fxThrows) throw new Error('no fx');
        if (from === to) return 1;
        return opts?.fxRate ?? 35;
      }),
    } as unknown as IFxRateProvider;

    // Komisyon artık platform-global ayardan gelir (klinikten değil). Test %20 kullanır.
    const serviceFee = {
      getServiceFeePercent: jest.fn(() => opts?.serviceFeePercent ?? 20),
    } as unknown as IServiceFeeProvider;

    const repo = {
      create: jest.fn(async (e: BookingPayment) => {
        saved.push(e);
        return e;
      }),
    } as unknown as IBookingPaymentCommandRepository;

    const txManager = {
      run: jest.fn(async (cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    return {
      handler: new InitiateBookingPaymentHandler(
        iyzicoLink,
        stripeLink,
        fx,
        serviceFee,
        repo,
        txManager
      ),
      iyzicoLink,
      stripeLink,
      repo,
      saved,
    };
  };

  it('EUR net + %20 fee → sale 120 EUR; iyzico TRY (×35=4200) + Stripe EUR; kayıt PENDING', async () => {
    const { handler, repo, saved } = build({ fxRate: 35 });
    const res = await handler.execute(
      new InitiateBookingPaymentCommand(baseInput)
    );

    expect(res.saleAmount).toBe(120);
    expect(res.saleCurrency).toBe('EUR');
    expect(res.iyzico).toEqual({
      url: 'https://iyzi/pay',
      amount: 4200,
      currency: 'TRY',
    });
    expect(res.stripe).toEqual({
      url: 'https://stripe/pay',
      amount: 120,
      currency: 'EUR',
    });
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(saved[0].status).toBe('PENDING');
    expect(saved[0].iyzicoUrl?.value).toBe('https://iyzi/pay');
    expect(saved[0].stripeSessionId).toBe('cs_1');
  });

  it('FX çözülemezse iyzico atlanır, Stripe yine üretilir', async () => {
    const { handler, iyzicoLink } = build({ fxThrows: true });
    const res = await handler.execute(
      new InitiateBookingPaymentCommand(baseInput)
    );
    expect(res.iyzico).toBeNull();
    expect(res.stripe).not.toBeNull();
    expect(iyzicoLink.createLink).not.toHaveBeenCalled();
  });

  it('satış TRY ise Stripe atlanır, yalnız iyzico üretilir', async () => {
    const { handler, stripeLink } = build();
    const res = await handler.execute(
      new InitiateBookingPaymentCommand({ ...baseInput, netCurrency: 'TRY' })
    );
    expect(res.stripe).toBeNull();
    expect(res.iyzico).not.toBeNull();
    expect(res.iyzico?.currency).toBe('TRY');
    expect(stripeLink.createLink).not.toHaveBeenCalled();
  });

  it('iki sağlayıcı da başarısızsa hata fırlatır', async () => {
    const { handler } = build({ iyzicoThrows: true, stripeThrows: true });
    await expect(
      handler.execute(new InitiateBookingPaymentCommand(baseInput))
    ).rejects.toThrow();
  });
});
