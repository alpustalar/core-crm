import { LeaveBalance } from './leave-balance.vo';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

describe('LeaveBalance VO', () => {
  it('calculate → kalan = hak ediş - kullanılan', () => {
    const balance = LeaveBalance.calculate({ entitlement: 14, usedDays: 5 });

    expect(balance.entitlement).toBe(14);
    expect(balance.used).toBe(5);
    expect(balance.remaining).toBe(9);
  });

  it('remaining → hak edişten fazla kullanımda negatif olabilir (gerçeği gizlemez)', () => {
    const balance = LeaveBalance.calculate({ entitlement: 14, usedDays: 20 });

    expect(balance.remaining).toBe(-6);
  });

  it('exceeds → talep kalandan büyükse true, eşitse false', () => {
    const balance = LeaveBalance.calculate({ entitlement: 14, usedDays: 9 });

    expect(balance.exceeds(6)).toBe(true);
    expect(balance.exceeds(5)).toBe(false); // tam bakiye kadar talep geçerli
    expect(balance.exceeds(1)).toBe(false);
  });

  it('periodOf → verilen tarihin takvim yılını sınırlar', () => {
    const period = LeaveBalance.periodOf(
      DateTimeManager.create(new Date('2026-06-15T10:00:00Z').getTime())
    );

    expect(DateTimeManager.getYear(period.from)).toBe(2026);
    expect(DateTimeManager.getYear(period.to)).toBe(2026);
    expect(period.from.getTime()).toBeLessThan(period.to.getTime());
  });

  it('periodOf → argümansız çağrı içinde bulunulan yılı verir', () => {
    const period = LeaveBalance.periodOf();

    expect(DateTimeManager.getYear(period.from)).toBe(
      DateTimeManager.currentYear()
    );
  });

  it('toView → düz read-model döner (entity/VO sızmaz)', () => {
    const view = LeaveBalance.calculate({
      entitlement: 14,
      usedDays: 4,
    }).toView();

    expect(view).toEqual({ entitlement: 14, used: 4, remaining: 10 });
  });
});
