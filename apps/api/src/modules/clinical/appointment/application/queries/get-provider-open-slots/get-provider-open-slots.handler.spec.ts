import { GetProviderOpenSlotsHandler } from './get-provider-open-slots.handler';
import { GetProviderOpenSlotsQuery } from './get-provider-open-slots.query';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { GetProviderAvailabilityQuery } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.query';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

describe('GetProviderOpenSlotsHandler (A1 — boş slot önerisi)', () => {
  const ctx = { actor: { clinicId: 'clinic-1' } } as never;
  const DATE = '2026-06-27';

  // İstanbul (UTC+3) yerelinde dolu randevu: 10:00–10:30 → UTC 07:00–07:30
  const occupied10 = {
    id: 'a1',
    startTime: new Date('2026-06-27T07:00:00Z'),
    endTime: new Date('2026-06-27T07:30:00Z'),
    status: 'CONFIRMED',
  };

  const workingDay = {
    date: DATE,
    isWorkingDay: true,
    reason: null,
    workingHours: {
      startMinute: 540, // 09:00
      endMinute: 1020, // 17:00
      breakStartMinute: 720, // 12:00
      breakEndMinute: 780, // 13:00
    },
    providerExceptions: [],
    occupiedSlots: [occupied10],
  };

  const build = (day: unknown) => {
    const queryBus = {
      execute: jest.fn((query: unknown) => {
        if (query instanceof GetClinicTimezoneQuery) {
          return Promise.resolve({ data: 'Europe_Istanbul' });
        }
        if (query instanceof GetProviderAvailabilityQuery) {
          return Promise.resolve({ data: day ? [day] : [] });
        }
        throw new Error('beklenmeyen query');
      }),
    } as unknown as TSQueryBus;

    return new GetProviderOpenSlotsHandler(queryBus);
  };

  const run = (handler: GetProviderOpenSlotsHandler) =>
    handler.execute(
      new GetProviderOpenSlotsQuery(
        {
          providerId: 'prov-1',
          clinicId: 'clinic-1',
          date: DATE,
          durationMinutes: 30,
        },
        ctx
      )
    );

  beforeEach(() => {
    // "now" geçmiş kontrolünü etkilemesin: tüm slotlar gelecekte kalsın
    jest.useFakeTimers({ now: new Date('2026-06-26T00:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('çalışma saatlerinden mola ve dolu randevuyu çıkararak slot üretir', async () => {
    const { data: slots } = await run(build(workingDay));
    const times = slots.map((s) => s.time);

    // Beklenen bazı boş slotlar
    expect(times).toContain('09:00');
    expect(times).toContain('10:30');
    expect(times).toContain('13:00');
    expect(times).toContain('16:30'); // son slot 16:30–17:00

    // Dolu randevu (10:00) ve mola (12:00, 12:30) dışlanmalı
    expect(times).not.toContain('10:00');
    expect(times).not.toContain('12:00');
    expect(times).not.toContain('12:30');

    // 17:00 başlangıçlı slot çalışma penceresine sığmaz
    expect(times).not.toContain('17:00');
  });

  it('her slotun start alanı yerel saatin doğru UTC karşılığıdır', async () => {
    const { data: slots } = await run(build(workingDay));
    const nine = slots.find((s) => s.time === '09:00');
    // 09:00 İstanbul = 06:00 UTC
    expect(nine?.start.toISOString()).toBe('2026-06-27T06:00:00.000Z');
  });

  it('çalışma günü değilse boş döner', async () => {
    const closedDay = {
      ...workingDay,
      isWorkingDay: false,
      workingHours: null,
    };
    const { data: slots } = await run(build(closedDay));
    expect(slots).toEqual([]);
  });

  it('o güne ait müsaitlik yoksa boş döner', async () => {
    const { data: slots } = await run(build(null));
    expect(slots).toEqual([]);
  });
});
