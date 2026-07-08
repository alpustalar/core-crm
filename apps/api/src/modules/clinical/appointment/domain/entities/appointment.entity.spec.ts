import { randomUUID } from 'crypto';
import { TimeZoneSchema } from '@shared';
import { AppointmentStatusSchema } from '@input-type-schemas/AppointmentStatusSchema';
import { Appointment } from './appointment.entity';
import { AppointmentCancelledEvent } from '@modules/clinical/appointment/domain/events/cancelled-appointment.event';

const HOUR_MS = 60 * 60 * 1000;

/**
 * Kritik domain kuralları için kalıcı test: hasta erteleme saat sınırı
 * (klinik ayarından gelen `rescheduleLimitHours`) ve iptal event'lerinin
 * (AppointmentCancelledEvent) fırlatılması.
 */
function buildFutureAppointment(hoursFromNow: number): Appointment {
  const start = new Date(Date.now() + hoursFromNow * HOUR_MS);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const appointment = Appointment.book({
    providerId: randomUUID(),
    clinicId: randomUUID(),
    patientId: randomUUID(),
    patientName: 'Test Hasta',
    patientPhone: '+905321234567',
    startTime: start,
    endTime: end,
    timezone: TimeZoneSchema.enum.Europe_Istanbul,
    isConsultation: false,
  });

  appointment.clearDomainEvents();
  return appointment;
}

describe('Appointment — hasta erteleme saat sınırı (rescheduleLimitHours)', () => {
  it('sınırdan az süre kaldıysa erteleme reddedilir', () => {
    const appointment = buildFutureAppointment(3); // 3 saat kaldı
    const newStart = new Date(Date.now() + 72 * HOUR_MS);
    const newEnd = new Date(newStart.getTime() + 30 * 60 * 1000);

    expect(() =>
      appointment.rescheduleByPatient({
        startTime: newStart,
        endTime: newEnd,
        providerId: randomUUID(),
        rescheduleLimitHours: 6, // 3 < 6 → çok geç
      })
    ).toThrow();
  });

  it('sınırdan fazla süre kaldıysa erteleme uygulanır ve PENDING olur', () => {
    const appointment = buildFutureAppointment(48); // 48 saat kaldı
    const newStart = new Date(Date.now() + 72 * HOUR_MS);
    const newEnd = new Date(newStart.getTime() + 30 * 60 * 1000);

    appointment.rescheduleByPatient({
      startTime: newStart,
      endTime: newEnd,
      providerId: randomUUID(),
      rescheduleLimitHours: 6, // 48 > 6 → izinli
    });

    expect(appointment.status).toBe(AppointmentStatusSchema.enum.PENDING);
  });
});

describe('Appointment — iptal event fırlatma', () => {
  it('cancelBooking (hasta) AppointmentCancelledEvent fırlatır', () => {
    const appointment = buildFutureAppointment(48);

    appointment.cancelBooking(randomUUID(), 'plan değişti');

    const events = appointment.getDomainEvents();
    expect(events.some((e) => e instanceof AppointmentCancelledEvent)).toBe(
      true
    );
    expect(appointment.status).toBe(AppointmentStatusSchema.enum.CANCELLED);
  });

  it('cancelSchedule (personel) AppointmentCancelledEvent fırlatır', () => {
    const appointment = buildFutureAppointment(48);

    appointment.cancelSchedule(randomUUID(), 'klinik kararı');

    const events = appointment.getDomainEvents();
    expect(events.some((e) => e instanceof AppointmentCancelledEvent)).toBe(
      true
    );
    expect(appointment.status).toBe(AppointmentStatusSchema.enum.CANCELLED);
  });
});
