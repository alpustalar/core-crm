import { FinancialEvent } from '@shared';
import { PaymentMadeRule } from './payment-made.rule';
import { PaymentMadeEventPayload } from '../event-payloads';
import { PostingContext } from '../posting-rule.interface';

const PARTY_ID = 'party-1';

const buildEvent = (
  payload: Partial<PaymentMadeEventPayload> = {}
): FinancialEvent =>
  ({
    occurredAt: new Date('2026-08-08T12:00:00Z'),
    payload: {
      method: 'BANK_TRANSFER',
      amount: '5000.00',
      partyId: PARTY_ID,
      ...payload,
    },
  }) as unknown as FinancialEvent;

const ctx = {} as PostingContext;

describe('PaymentMadeRule', () => {
  const rule = new PaymentMadeRule();

  it('satıcı borcunu kapatır: 320 BORÇLANIR (alacaklanmaz)', () => {
    const entry = rule.build(buildEvent(), ctx);
    const suppliers = entry.lines.find((l) => l.accountCode === '320');

    // Yön kritik: bu kural borcu kapatmak için var. Alacak yazsaydı borcu
    // kapatmak yerine büyütürdü.
    expect(suppliers?.debit).toBe('5000.00');
    expect(suppliers?.credit).toBeUndefined();
  });

  it('320 cari bazlı: partyId satıra taşınır', () => {
    const entry = rule.build(buildEvent(), ctx);
    const suppliers = entry.lines.find((l) => l.accountCode === '320');

    expect(suppliers?.partyId).toBe(PARTY_ID);
  });

  it('havale → 102 Bankalar alacaklanır', () => {
    const entry = rule.build(buildEvent({ method: 'BANK_TRANSFER' }), ctx);

    expect(entry.lines.find((l) => l.accountCode === '102')?.credit).toBe(
      '5000.00'
    );
  });

  it('nakit → 100 Kasa alacaklanır', () => {
    const entry = rule.build(buildEvent({ method: 'CASH' }), ctx);

    expect(entry.lines.find((l) => l.accountCode === '100')?.credit).toBe(
      '5000.00'
    );
    expect(entry.lines.find((l) => l.accountCode === '102')).toBeUndefined();
  });

  it('fiş denk', () => {
    const entry = rule.build(buildEvent(), ctx);

    const debit = entry.lines.reduce((s, l) => s + Number(l.debit ?? 0), 0);
    const credit = entry.lines.reduce((s, l) => s + Number(l.credit ?? 0), 0);

    expect(debit).toBe(credit);
  });

  it('dekont referansı fiş açıklamasına geçer', () => {
    const entry = rule.build(buildEvent({ reference: 'DKT-2026-42' }), ctx);

    expect(entry.description).toContain('DKT-2026-42');
  });

  it('yabancı para taşınır — çevrimi posting yapar (Model A)', () => {
    const entry = rule.build(buildEvent({ currency: 'EUR' }), ctx);

    expect(entry.currency).toBe('EUR');
  });
});
