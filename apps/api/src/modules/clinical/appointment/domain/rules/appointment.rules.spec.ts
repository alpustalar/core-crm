import { randomUUID } from 'crypto';
import { AppointmentRules } from './appointment.rules';
import { AppointmentStatusSchema } from '@shared';
import { AppointmentStatusType } from '@input-type-schemas/AppointmentStatusSchema';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';

/**
 * Kurallar entity'ye değil düz snapshot'a bağlı olduğu için burada hiçbir
 * Appointment entity'si kurulmuyor — okuma tarafının da yapabileceği şey bu.
 */
describe('AppointmentRules (snapshot tabanlı)', () => {
  const rulesFor = (status: AppointmentStatusType) =>
    new AppointmentRules({ id: randomUUID(), status }, DefaultValidateOptions);

  const { PENDING, CONFIRMED, CANCELLED, COMPLETED, NOSHOW, ARRIVED } =
    AppointmentStatusSchema.enum;

  it('confirm → yalnız PENDING onaylanabilir', () => {
    expect(rulesFor(PENDING).confirm.isValid).toBe(true);
    expect(rulesFor(CONFIRMED).confirm.isValid).toBe(false);
    expect(rulesFor(CANCELLED).confirm.isValid).toBe(false);
  });

  it('checkIn → PENDING ve CONFIRMED açık, sonuçlanmışlar kapalı', () => {
    expect(rulesFor(PENDING).checkIn.isValid).toBe(true);
    expect(rulesFor(CONFIRMED).checkIn.isValid).toBe(true);
    expect(rulesFor(COMPLETED).checkIn.isValid).toBe(false);
    expect(rulesFor(CANCELLED).checkIn.isValid).toBe(false);
  });

  it('markAsNoShow → yalnız gerçekleşmemiş randevular', () => {
    expect(rulesFor(PENDING).markAsNoShow.isValid).toBe(true);
    expect(rulesFor(CONFIRMED).markAsNoShow.isValid).toBe(true);
    expect(rulesFor(NOSHOW).markAsNoShow.isValid).toBe(false);
    expect(rulesFor(COMPLETED).markAsNoShow.isValid).toBe(false);
  });

  it('complete → sonuçlanmış (CANCELLED/COMPLETED/NOSHOW) olanlar tamamlanamaz', () => {
    expect(rulesFor(ARRIVED).complete.isValid).toBe(true);
    expect(rulesFor(CONFIRMED).complete.isValid).toBe(true);
    expect(rulesFor(CANCELLED).complete.isValid).toBe(false);
    expect(rulesFor(COMPLETED).complete.isValid).toBe(false);
    expect(rulesFor(NOSHOW).complete.isValid).toBe(false);
  });

  it('canBeCancelled / canBeScheduled → sonuçlanmışlarda kapalı', () => {
    expect(rulesFor(CONFIRMED).canBeCancelled.isValid).toBe(true);
    expect(rulesFor(COMPLETED).canBeCancelled.isValid).toBe(false);

    expect(rulesFor(PENDING).canBeScheduled.isValid).toBe(true);
    expect(rulesFor(NOSHOW).canBeScheduled.isValid).toBe(false);
  });

  it('orThrow → geçersiz durumda domain exception fırlatır', () => {
    expect(() => rulesFor(CANCELLED).confirm.orThrow()).toThrow();
    expect(() => rulesFor(PENDING).confirm.orThrow()).not.toThrow();
  });

  it('schedule → geçmiş başlangıç zamanı reddedilir', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000);
    const future = new Date(Date.now() + 60 * 60 * 1000);

    expect(rulesFor(PENDING).schedule({ startTime: past }).isValid).toBe(false);
    expect(rulesFor(PENDING).schedule({ startTime: future }).isValid).toBe(true);
  });
});
