import { RefundBookingPaymentHandler } from './refund-booking-payment.handler';
import { RefundBookingPaymentCommand } from './refund-booking-payment.command';
import { IPaymentLinkProvider } from '@src/infrastructure/payment/links/payment-link.port';
import {
  IBookingPaymentCommandRepository,
  IBookingPaymentQueryRepository,
} from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment.repository';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import {
  CreateBookingPaymentProps,
  HotelBookingIntent,
} from '@modules/crm/health-tourism/booking-payment/domain/booking-payment.contracts';

describe('RefundBookingPaymentHandler — iptal sonrası iade', () => {
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
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    patientId: 'patient-1',
    leadId: null,
    conversationId: 'conv-1',
  };

  const makeBooked = (provider: 'IYZICO' | 'STRIPE'): BookingPayment => {
    const bp = BookingPayment.create(props);
    bp.markPaid(provider, provider === 'IYZICO' ? 'tx_1' : 'pi_1');
    bp.markBooked('BK-1', 'BK-1');
    return bp;
  };

  const build = (bp: BookingPayment | null) => {
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
      findByBookingId: jest.fn(async () => bp),
    } as unknown as IBookingPaymentQueryRepository;
    const saved: BookingPayment[] = [];
    const commandRepo = {
      save: jest.fn(async (e: BookingPayment) => {
        saved.push(e);
        return e;
      }),
    } as unknown as IBookingPaymentCommandRepository;

    return {
      handler: new RefundBookingPaymentHandler(
        iyzicoLink,
        stripeLink,
        queryRepo,
        commandRepo
      ),
      iyzicoLink,
      stripeLink,
      commandRepo,
      saved,
    };
  };

  it('Stripe ile ödenmişse saleAmount/saleCurrency iade + REFUNDED', async () => {
    const bp = makeBooked('STRIPE');
    const { handler, stripeLink, saved } = build(bp);

    await handler.execute(new RefundBookingPaymentCommand('BK-1', 'iptal'));

    expect(stripeLink.refund).toHaveBeenCalledWith(
      expect.objectContaining({ providerRef: 'pi_1', amount: 120, currency: 'EUR' })
    );
    expect(bp.status).toBe('REFUNDED');
    expect(saved).toHaveLength(1);
  });

  it('iyzico ile ödenmişse tryAmount/TRY iade', async () => {
    const bp = makeBooked('IYZICO');
    const { handler, iyzicoLink } = build(bp);

    await handler.execute(new RefundBookingPaymentCommand('BK-1'));

    expect(iyzicoLink.refund).toHaveBeenCalledWith(
      expect.objectContaining({ providerRef: 'tx_1', amount: 4200, currency: 'TRY' })
    );
    expect(bp.status).toBe('REFUNDED');
  });

  it('ödeme kaydı yoksa (B7 öncesi) iade YOK, hata fırlatmaz', async () => {
    const { handler, iyzicoLink, stripeLink } = build(null);
    await expect(
      handler.execute(new RefundBookingPaymentCommand('BK-UNKNOWN'))
    ).resolves.toBeUndefined();
    expect(iyzicoLink.refund).not.toHaveBeenCalled();
    expect(stripeLink.refund).not.toHaveBeenCalled();
  });

  it('durum BOOKED değilse (ör. zaten REFUNDED) iade tekrarlanmaz', async () => {
    const bp = makeBooked('STRIPE');
    bp.markRefunded('önceden iade');
    const { handler, stripeLink } = build(bp);

    await handler.execute(new RefundBookingPaymentCommand('BK-1'));
    expect(stripeLink.refund).not.toHaveBeenCalled();
  });
});
