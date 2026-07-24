import { AttendanceRecord } from './attendance-record.entity';
import {
  AttendanceAlreadyClosedException,
  AttendanceInvalidTimeRangeException,
} from '@modules/hr/attendance/domain/exceptions/attendance.exceptions';
import { randomUUID } from 'crypto';

describe('AttendanceRecord entity', () => {
  const employeeId = randomUUID();
  const organizationId = randomUUID();
  const clinicId = randomUUID();

  const baseProps = () => ({ employeeId, organizationId, clinicId });

  it('checkIn → status OPEN, checkOutAt null, workedMinutes null', () => {
    const record = AttendanceRecord.checkIn(baseProps());

    expect(record.id.value).toBeDefined();
    expect(record.employeeId.value).toBe(employeeId);
    expect(record.status).toBe('OPEN');
    expect(record.checkOutAt).toBeNull();
    expect(record.workedMinutes).toBeNull();
    expect(record.overtimeMinutes).toBe(0);
  });

  it('checkOut → status CLOSED + workedMinutes/overtimeMinutes hesaplanır', () => {
    const record = AttendanceRecord.checkIn(baseProps());

    record.checkOut();

    expect(record.status).toBe('CLOSED');
    expect(record.checkOutAt).toBeInstanceOf(Date);
    expect(record.workedMinutes).toBeGreaterThanOrEqual(0);
    expect(record.overtimeMinutes).toBe(0); // anlık check-in/out → 8 saati geçmez
  });

  it('checkOut → zaten kapalı kayıt tekrar kapatılamaz', () => {
    const record = AttendanceRecord.checkIn(baseProps());
    record.checkOut();

    expect(() => record.checkOut()).toThrow(AttendanceAlreadyClosedException);
  });

  it('record → 8 saatlik mesai fazla mesai üretmez', () => {
    const checkInAt = new Date('2026-07-20T09:00:00.000Z');
    const checkOutAt = new Date('2026-07-20T17:00:00.000Z');

    const record = AttendanceRecord.record({
      ...baseProps(),
      workDate: checkInAt,
      checkInAt,
      checkOutAt,
    });

    expect(record.status).toBe('CLOSED');
    expect(record.workedMinutes).toBe(480);
    expect(record.overtimeMinutes).toBe(0);
  });

  it('record → 8 saati aşan mesai fazla mesaiye yansır', () => {
    const checkInAt = new Date('2026-07-20T09:00:00.000Z');
    const checkOutAt = new Date('2026-07-20T20:00:00.000Z'); // 11 saat

    const record = AttendanceRecord.record({
      ...baseProps(),
      workDate: checkInAt,
      checkInAt,
      checkOutAt,
    });

    expect(record.workedMinutes).toBe(660);
    expect(record.overtimeMinutes).toBe(180); // 11 saat - 8 saat = 3 saat
  });

  it('record → checkOutAt < checkInAt ise hata fırlatır', () => {
    const checkInAt = new Date('2026-07-20T17:00:00.000Z');
    const checkOutAt = new Date('2026-07-20T09:00:00.000Z');

    expect(() =>
      AttendanceRecord.record({
        ...baseProps(),
        workDate: checkInAt,
        checkInAt,
        checkOutAt,
      })
    ).toThrow(AttendanceInvalidTimeRangeException);
  });

  it('toPersistence düz shape döner', () => {
    const record = AttendanceRecord.checkIn(baseProps());
    const raw = record.toPersistence();

    expect(raw.id).toBe(record.id.value);
    expect(raw.employeeId).toBe(employeeId);
    expect(raw.organizationId).toBe(organizationId);
    expect(raw.clinicId).toBe(clinicId);
    expect(raw.status).toBe('OPEN');
  });
});
