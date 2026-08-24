import {
  resolveEffectivePlanId,
  subscriptionGrantsAccess,
} from './entitlement-access.policy';
import { EntitlementSource } from '../contracts';

const GRACE_DAYS = 7;
const NOW = new Date('2026-07-05T12:00:00Z');

const base: EntitlementSource = {
  status: 'ACTIVE',
  trialEndsAt: null,
  currentPeriodEnd: null,
  planId: 'BASIC',
  addOnModuleKeys: [],
};

describe('subscriptionGrantsAccess', () => {
  it('geçerli deneme (trialEndsAt gelecekte) → erişim açık', () => {
    const src = { ...base, trialEndsAt: new Date('2026-07-10T00:00:00Z') };
    expect(subscriptionGrantsAccess(src, GRACE_DAYS, NOW)).toBe(true);
  });

  it('dolmuş deneme (trialEndsAt geçmişte) → erişim kapalı (grace yok)', () => {
    const src = { ...base, trialEndsAt: new Date('2026-07-01T00:00:00Z') };
    expect(subscriptionGrantsAccess(src, GRACE_DAYS, NOW)).toBe(false);
  });

  it('ACTIVE → açık', () => {
    expect(subscriptionGrantsAccess(base, GRACE_DAYS, NOW)).toBe(true);
  });

  it('PAST_DUE grace içinde → açık', () => {
    const src = {
      ...base,
      status: 'PAST_DUE',
      currentPeriodEnd: new Date('2026-07-01T00:00:00Z'), // +7g = 07-08 > now
    };
    expect(subscriptionGrantsAccess(src, GRACE_DAYS, NOW)).toBe(true);
  });

  it('PAST_DUE grace bitmiş → kapalı', () => {
    const src = {
      ...base,
      status: 'PAST_DUE',
      currentPeriodEnd: new Date('2026-06-20T00:00:00Z'), // +7g = 06-27 < now
    };
    expect(subscriptionGrantsAccess(src, GRACE_DAYS, NOW)).toBe(false);
  });

  it('CANCELED / EXPIRED → kapalı', () => {
    expect(
      subscriptionGrantsAccess({ ...base, status: 'CANCELED' }, GRACE_DAYS, NOW)
    ).toBe(false);
    expect(
      subscriptionGrantsAccess({ ...base, status: 'EXPIRED' }, GRACE_DAYS, NOW)
    ).toBe(false);
  });
});

describe('resolveEffectivePlanId', () => {
  it('FREE_TRIAL → BASIC (deneme BASIC bundle açar)', () => {
    expect(resolveEffectivePlanId('FREE_TRIAL')).toBe('BASIC');
  });

  it('diğer planlar aynen döner', () => {
    expect(resolveEffectivePlanId('PREMIUM')).toBe('PREMIUM');
    expect(resolveEffectivePlanId(null)).toBeNull();
  });
});
