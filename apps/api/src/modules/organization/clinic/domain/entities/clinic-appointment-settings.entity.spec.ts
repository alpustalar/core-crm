import { randomUUID } from 'crypto';
import { ClinicAppointmentSettings } from './clinic-appointment-settings.entity';

describe('ClinicAppointmentSettings', () => {
  const clinicId = randomUUID();

  it('createDefault → DB default değerleri', () => {
    const s = ClinicAppointmentSettings.createDefault(clinicId);
    expect(s.rescheduleLimitHours).toBe(6);
    expect(s.cancelLimitHours).toBe(24);
    expect(s.allowPatientCancel).toBe(true);
    expect(s.staffAllowOverbooking).toBe(true);
    expect(s.sendSmsReminderHours).toBe(24);
    expect(s.maxActivePatientBookings).toBe(3);
    expect(s.requireReminderResponse).toBe(false);
    expect(s.maxFutureBookingDays).toBe(90);
  });

  it('negatif saat sınırı → hata', () => {
    expect(() =>
      ClinicAppointmentSettings.create({ clinicId, rescheduleLimitHours: -1 })
    ).toThrow();
  });

  it('aktif randevu limiti 0 → hata', () => {
    expect(() =>
      ClinicAppointmentSettings.create({
        clinicId,
        maxActivePatientBookings: 0,
      })
    ).toThrow();
  });

  it('ileri gün sınırı 0 → hata', () => {
    expect(() =>
      ClinicAppointmentSettings.create({ clinicId, maxFutureBookingDays: 0 })
    ).toThrow();
  });

  it('validate.patientCancel.isAllowed → Guard değeri', () => {
    const s = ClinicAppointmentSettings.createDefault(clinicId);
    expect(s.validate.patientCancel.isAllowed.value).toBe(true);
  });
});
