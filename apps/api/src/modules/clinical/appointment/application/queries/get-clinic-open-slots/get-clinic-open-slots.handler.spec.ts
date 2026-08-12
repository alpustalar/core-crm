import type { IPolicyFactory } from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { GetClinicOpenSlotsHandler } from './get-clinic-open-slots.handler';
import { GetClinicOpenSlotsQuery } from './get-clinic-open-slots.query';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';
import { FindProvidersDirectoryQuery } from '@modules/clinical/provider/application/queries/find-providers-directory/find-providers-directory.query';
import { GetProviderAvailabilityQuery } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.query';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

/**
 * Klinik geneli açık slot bulucu. Mevcut müsaitlik motorunun (GetProviderAvailability)
 * çıktısını mock'layıp; çok-doktor birleştirme, mola/dolu/izin(OFF)/geçmiş eleme,
 * doktor filtresi ve slot süresi çözümü (override > klinik ayarı) doğrulanır.
 */
describe('GetClinicOpenSlotsHandler (klinik geneli açık slotlar)', () => {
  const ctx = { actor: { clinicId: 'clinic-1' } } as never;
  const DATE = '2026-06-27';

  const provAda = {
    providerId: 'prov-1',
    name: 'Dr. Ada',
    specialty: null,
    title: null,
    isActive: true,
  };
  const provBora = {
    providerId: 'prov-2',
    name: 'Dr. Bora',
    specialty: null,
    title: null,
    isActive: true,
  };

  // 09:00–10:00 İstanbul (UTC+3) = 06:00–07:00 UTC
  const workingHours = {
    startMinute: 540, // 09:00
    endMinute: 600, // 10:00
    breakStartMinute: null,
    breakEndMinute: null,
  };

  // Ada: 09:30 dolu (UTC 06:30–07:00) → 09:00 açık, 09:30 dolu
  const adaDay = {
    date: DATE,
    isWorkingDay: true,
    reason: null,
    workingHours,
    providerExceptions: [],
    occupiedSlots: [
      {
        id: 'a1',
        startTime: new Date('2026-06-27T06:30:00Z'),
        endTime: new Date('2026-06-27T07:00:00Z'),
        status: 'CONFIRMED',
      },
    ],
  };

  // Bora: 09:00–09:30 izinli/OFF (UTC 06:00–06:30) → 09:00 kapalı, 09:30 açık
  const boraDay = {
    date: DATE,
    isWorkingDay: true,
    reason: null,
    workingHours,
    providerExceptions: [
      {
        startTime: new Date('2026-06-27T06:00:00Z'),
        endTime: new Date('2026-06-27T06:30:00Z'),
        type: 'OFF' as const,
        reason: 'İzin',
      },
    ],
    occupiedSlots: [],
  };

  const build = (options: {
    providers: unknown[];
    daysByProvider: Record<string, unknown[]>;
    settingsDuration?: number;
  }) => {
    const queryBus = {
      execute: jest.fn((query: unknown) => {
        if (query instanceof GetClinicTimezoneQuery) {
          return Promise.resolve({ data: 'Europe_Istanbul' });
        }
        if (query instanceof GetClinicAppointmentSettingsQuery) {
          return Promise.resolve({
            data: { slotDurationMinutes: options.settingsDuration ?? 30 },
          });
        }
        if (query instanceof FindProvidersDirectoryQuery) {
          return Promise.resolve({ data: options.providers });
        }
        if (query instanceof GetProviderAvailabilityQuery) {
          const days = options.daysByProvider[query.filter.providerId] ?? [];
          return Promise.resolve({ data: days });
        }
        throw new Error('beklenmeyen query');
      }),
    } as unknown as TSQueryBus;

    const policyFactory = {
      appointment: () => ({
        policy: {
          getSerializationOptions: () => ({ groups: [], isGroupActive: false }),
        },
      }),
    } as unknown as IPolicyFactory;

    return new GetClinicOpenSlotsHandler(queryBus, policyFactory);
  };

  const run = (
    handler: GetClinicOpenSlotsHandler,
    overrides: { providerId?: string; slotDurationMinutes?: number } = {}
  ) =>
    handler.execute(
      new GetClinicOpenSlotsQuery(
        {
          clinicId: 'clinic-1',
          startDate: new Date('2026-06-27T00:00:00Z'),
          endDate: new Date('2026-06-27T23:59:00Z'),
          providerId: overrides.providerId,
          slotDurationMinutes: overrides.slotDurationMinutes,
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

  it('birden çok doktoru birleştirir; dolu ve OFF slotları eler, güne göre gruplar', async () => {
    const handler = build({
      providers: [provAda, provBora],
      daysByProvider: { 'prov-1': [adaDay], 'prov-2': [boraDay] },
    });

    const { data } = await run(handler);

    expect(data).toHaveLength(1);
    expect(data[0].date).toBe(DATE);

    const slots = data[0].slots;
    // Ada 09:00 açık + Bora 09:30 açık; başlangıca göre sıralı
    expect(slots.map((s) => `${s.time}@${s.providerName}`)).toEqual([
      '09:00@Dr. Ada',
      '09:30@Dr. Bora',
    ]);

    // Ada'nın dolu 09:30'u ve Bora'nın OFF 09:00'ı dışlanmalı
    expect(
      slots.find((s) => s.time === '09:30' && s.providerId === 'prov-1')
    ).toBeUndefined();
    expect(
      slots.find((s) => s.time === '09:00' && s.providerId === 'prov-2')
    ).toBeUndefined();

    // start alanı yerel saatin doğru UTC karşılığı (09:00 İstanbul = 06:00 UTC)
    const adaNine = slots.find((s) => s.providerId === 'prov-1');
    expect(adaNine?.start.toISOString()).toBe('2026-06-27T06:00:00.000Z');
    expect(adaNine?.end.toISOString()).toBe('2026-06-27T06:30:00.000Z');
  });

  it('providerId verilince yalnız o doktoru tarar', async () => {
    const handler = build({
      providers: [provAda, provBora],
      daysByProvider: { 'prov-1': [adaDay], 'prov-2': [boraDay] },
    });

    const { data } = await run(handler, { providerId: 'prov-2' });

    const slots = data[0].slots;
    expect(slots).toHaveLength(1);
    expect(slots[0].providerId).toBe('prov-2');
    expect(slots[0].time).toBe('09:30');
  });

  it('slotDurationMinutes override klinik ayarındaki varsayılanı ezer', async () => {
    // Ada'yı temiz (dolu yok) yap; 60 dk override → tek slot 09:00–10:00
    const cleanAdaDay = { ...adaDay, occupiedSlots: [] };
    const handler = build({
      providers: [provAda],
      daysByProvider: { 'prov-1': [cleanAdaDay] },
      settingsDuration: 30,
    });

    const { data } = await run(handler, { slotDurationMinutes: 60 });

    const slots = data[0].slots;
    expect(slots).toHaveLength(1);
    expect(slots[0].time).toBe('09:00');
    expect(slots[0].durationMinutes).toBe(60);
  });

  it('klinikte aktif doktor yoksa boş döner', async () => {
    const handler = build({ providers: [], daysByProvider: {} });
    const { data } = await run(handler);
    expect(data).toEqual([]);
  });
});
