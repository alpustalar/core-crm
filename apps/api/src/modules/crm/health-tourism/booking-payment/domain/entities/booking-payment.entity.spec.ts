import { BookingPayment } from './booking-payment.entity';
import {
  CreateBookingPaymentProps,
  HotelBookingIntent,
} from '../contracts/booking-payment';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';

describe('BookingPayment entity — durum makinesi', () => {
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

  const baseProps: CreateBookingPaymentProps = {
    bookingType: 'HOTEL',
    saleCurrency: 'EUR',
    saleAmount: 120,
    tryAmount: 4200,
    netAmount: 100,
    fxRate: 35,
    intent: hotelIntent,
    clinicId: '11111111-1111-4111-8111-111111111111',
    organizationId: '22222222-2222-4222-8222-222222222222',
    patientId: null,
    leadId: '33333333-3333-4333-8333-333333333333',
    conversationId: 'conv-1',
  };

  it('create → PENDING; tutarlar Decimal; intent tipli okunur', () => {
    const bp = BookingPayment.create(baseProps);
    expect(bp.status).toBe('PENDING');
    expect(bp.validate.status.isPending.value).toBe(true);
    expect(bp.saleAmount.value.toNumber()).toBe(120);
    expect(bp.tryAmount.value.toNumber()).toBe(4200);
    expect(bp.fxRate?.toNumber()).toBe(35);
    expect(bp.bookingIntent.type).toBe('HOTEL');
  });

  it('attachLinks: sağlayıcı link bilgilerini saklar', () => {
    const bp = BookingPayment.create(baseProps);
    bp.attachLinks({
      iyzicoConversationId: bp.id.value,
      iyzicoToken: 'tok',
      iyzicoUrl: 'https://iyzi',
      stripeSessionId: 'cs_1',
      stripeUrl: 'https://stripe',
    });
    expect(bp.iyzicoUrl?.value).toBe('https://iyzi');
    expect(bp.stripeSessionId).toBe('cs_1');
  });

  it('markPaid: PENDING → PAID; provider + ref + paidAt set edilir', () => {
    const bp = BookingPayment.create(baseProps);
    bp.markPaid('STRIPE', 'pi_123');
    expect(bp.status).toBe('PAID');
    expect(bp.paidProvider).toBe('STRIPE');
    expect(bp.paidProviderRef).toBe('pi_123');
    expect(bp.paidAt).toBeInstanceOf(Date);
    expect(bp.validate.status.isSettled.value).toBe(true);
  });

  it('markPaid ikinci kez → hata (idempotency koruması, rules katmanı)', () => {
    // Durum geçiş koruması artık entity metodunda değil, rules() üzerinden uygulanıyor.
    const bp = BookingPayment.create(baseProps);
    bp.markPaid('IYZICO', 'tx_1');
    expect(() =>
      bp.rules(DefaultValidateOptions).markPaid().orThrow()
    ).toThrow();
  });

  it('markBooked yalnız PAID sonrası; PENDING’den → hata (rules katmanı)', () => {
    const bp = BookingPayment.create(baseProps);
    expect(() =>
      bp.rules(DefaultValidateOptions).markBooked().orThrow()
    ).toThrow();
    bp.markPaid('STRIPE', 'pi_1');
    bp.markBooked('BK-1', 'BK-1');
    expect(bp.status).toBe('BOOKED');
    expect(bp.bookingReference).toBe('BK-1');
    expect(bp.validate.status.isSettled.value).toBe(true);
  });

  it('markExpired yalnız PENDING; ödenmişten → hata (rules katmanı)', () => {
    const bp = BookingPayment.create(baseProps);
    bp.markExpired();
    expect(bp.status).toBe('EXPIRED');

    const paid = BookingPayment.create(baseProps);
    paid.markPaid('IYZICO', 'tx');
    expect(() =>
      paid.rules(DefaultValidateOptions).markExpired().orThrow()
    ).toThrow();
  });

  it('markFailed + markRefunded: book başarısız → iade akışı', () => {
    const bp = BookingPayment.create(baseProps);
    bp.markPaid('STRIPE', 'pi_1');
    bp.markFailed('rate expired');
    expect(bp.status).toBe('FAILED');
    expect(bp.failureReason).toBe('rate expired');
    bp.markRefunded('rate expired');
    expect(bp.status).toBe('REFUNDED');
  });
});
