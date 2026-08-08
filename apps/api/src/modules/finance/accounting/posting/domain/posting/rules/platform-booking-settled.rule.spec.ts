import { Decimal } from 'decimal.js';
import { FinancialEvent } from '@shared';
import { PlatformBookingSettledRule } from './platform-booking-settled.rule';
import { PlatformBookingSettledEventPayload } from '../event-payloads';
import { PlatformBookingAmountsMismatchException } from '../../exceptions/posting.exceptions';
import { PostingContext } from '../posting-rule.interface';

const OCCURRED_AT = new Date('2026-08-08T10:00:00Z');

const buildEvent = (
  payload: Partial<PlatformBookingSettledEventPayload> = {}
): FinancialEvent =>
  ({
    occurredAt: OCCURRED_AT,
    payload: {
      saleAmount: '1200.00',
      supplierAmount: '1000.00',
      commission: '200.00',
      currency: 'EUR',
      bookingType: 'HOTEL',
      provider: 'STRIPE',
      ...payload,
    },
  }) as unknown as FinancialEvent;

const ctx = {} as PostingContext;

describe('PlatformBookingSettledRule', () => {
  const rule = new PlatformBookingSettledRule();

  it('aracı (net) yaklaşımı: hasılat yalnız komisyon, tedarikçi payı borç', () => {
    const entry = rule.build(buildEvent(), ctx);

    const byAccount = Object.fromEntries(
      entry.lines.map((l) => [l.accountCode, l])
    );

    // Tahsilat sağlayıcıda yolda.
    expect(byAccount['108'].debit).toBe('1200.00');
    // Platform geliri SADECE komisyon — brüt yazılsaydı ciro tedarikçi payı
    // kadar şişerdi.
    expect(byAccount['601'].credit).toBe('200.00');
    // Tedarikçi payı hasılat değil, HotelBeds'e borç.
    expect(byAccount['320'].credit).toBe('1000.00');
  });

  it('fiş denk: borç toplamı = alacak toplamı', () => {
    const entry = rule.build(buildEvent(), ctx);

    const debit = entry.lines.reduce(
      (sum, l) => sum.plus(l.debit ?? 0),
      new Decimal(0)
    );
    const credit = entry.lines.reduce(
      (sum, l) => sum.plus(l.credit ?? 0),
      new Decimal(0)
    );

    expect(debit.toFixed(2)).toBe('1200.00');
    expect(debit.equals(credit)).toBe(true);
  });

  it('tutarlar tutarsızsa fiş üretmez — dengesiz kayıt mizanı bozmasın', () => {
    // komisyon + tedarikçi ≠ brüt (bir kuruş sapma)
    const event = buildEvent({ commission: '199.99' });

    expect(() => rule.build(event, ctx)).toThrow(
      PlatformBookingAmountsMismatchException
    );
  });

  it('satış para birimini taşır — çevrimi posting yapar (Model A)', () => {
    const entry = rule.build(buildEvent({ currency: 'USD' }), ctx);

    expect(entry.currency).toBe('USD');
  });

  it('olayın tarihi fişin tarihidir', () => {
    const entry = rule.build(buildEvent(), ctx);

    expect(entry.date).toBe(OCCURRED_AT);
  });

  it('rezervasyon türü fiş açıklamasına geçer', () => {
    const entry = rule.build(buildEvent({ bookingType: 'TRANSFER' }), ctx);

    expect(entry.description).toContain('TRANSFER');
  });

  it('komisyonsuz satışta (maliyetine) yalnız tedarikçi borcu doğar', () => {
    const entry = rule.build(
      buildEvent({
        saleAmount: '1000.00',
        supplierAmount: '1000.00',
        commission: '0.00',
      }),
      ctx
    );

    const revenue = entry.lines.find((l) => l.accountCode === '601');
    expect(revenue?.credit).toBe('0.00');
  });
});
