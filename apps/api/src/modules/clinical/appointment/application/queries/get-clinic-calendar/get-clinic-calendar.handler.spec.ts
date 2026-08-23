import { GetClinicCalendarHandler } from './get-clinic-calendar.handler';
import { GetClinicCalendarQuery } from './get-clinic-calendar.query';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { FindProvidersDirectoryQuery } from '@modules/clinical/provider/application/queries/find-providers-directory/find-providers-directory.query';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ClinicCalendarEventRow } from '@modules/clinical/appointment/domain/contracts/appointment';

/**
 * Klinik tam takvimi. Repo projeksiyonu + doktor directory mock'lanır; güne gruplama
 * (klinik yereli), doktor adı zenginleştirme, sıralama, providerId filtresinin repo'ya
 * geçmesi ve yetki reddi doğrulanır.
 */
describe('GetClinicCalendarHandler (klinik tam takvim)', () => {
  const ctx = { actor: { clinicId: 'clinic-1' } } as never;

  const provAda = { providerId: 'prov-1', name: 'Dr. Ada' };
  const provBora = { providerId: 'prov-2', name: 'Dr. Bora' };

  const row = (over: Partial<ClinicCalendarEventRow>): ClinicCalendarEventRow => ({
    id: 'apt-x',
    providerId: 'prov-1',
    patientId: 'pat-1',
    patientName: 'Ali Veli',
    patientPhone: '+9055',
    startTime: new Date('2026-05-03T07:00:00Z'),
    endTime: new Date('2026-05-03T07:30:00Z'),
    status: 'CONFIRMED',
    treatmentType: null,
    isConsultation: false,
    ...over,
  });

  const build = (options: {
    rows: ClinicCalendarEventRow[];
    providers?: { providerId: string; name: string }[];
    canAccess?: boolean;
    capture?: (dto: unknown) => void;
  }) => {
    const canAccess = options.canAccess ?? true;

    const policyFactory = {
      appointment: () => ({
        policy: {
          getSerializationOptions: jest.fn(() =>
            canAccess
              ? { isGroupActive: true, groups: ['INTERNAL'] }
              : { isGroupActive: false, groups: [] }
          ),
        },
      }),
    } as never;

    const appointmentRepo = {
      findClinicCalendarEvents: jest.fn((dto: unknown) => {
        options.capture?.(dto);
        return Promise.resolve(options.rows);
      }),
    } as never;

    const queryBus = {
      execute: jest.fn((query: unknown) => {
        if (query instanceof GetClinicTimezoneQuery) {
          return Promise.resolve({ data: 'Europe_Istanbul' });
        }
        if (query instanceof FindProvidersDirectoryQuery) {
          return Promise.resolve({
            data: options.providers ?? [provAda, provBora],
          });
        }
        throw new Error('beklenmeyen query');
      }),
    } as unknown as TSQueryBus;

    return new GetClinicCalendarHandler(appointmentRepo, policyFactory, queryBus);
  };

  const run = (
    handler: GetClinicCalendarHandler,
    providerId?: string
  ) =>
    handler.execute(
      new GetClinicCalendarQuery(
        {
          clinicId: 'clinic-1',
          startDate: new Date('2026-05-03T00:00:00Z'),
          endDate: new Date('2026-08-03T23:59:00Z'),
          providerId,
        },
        ctx
      )
    );

  it('randevuları klinik-yerel güne gruplar, doktor adını zenginleştirir ve sıralar', async () => {
    // Aynı gün (03.05) iki randevu farklı doktor; ayrı gün (04.05) bir randevu.
    const rows = [
      row({
        id: 'a2',
        providerId: 'prov-2',
        startTime: new Date('2026-05-03T08:00:00Z'), // 11:00 İstanbul
        endTime: new Date('2026-05-03T08:30:00Z'),
      }),
      row({
        id: 'a1',
        providerId: 'prov-1',
        startTime: new Date('2026-05-03T07:00:00Z'), // 10:00 İstanbul
        endTime: new Date('2026-05-03T07:30:00Z'),
      }),
      row({
        id: 'a3',
        providerId: 'prov-1',
        startTime: new Date('2026-05-04T06:00:00Z'), // 09:00 İstanbul ertesi gün
        endTime: new Date('2026-05-04T06:30:00Z'),
      }),
    ];

    const { data } = await run(build({ rows }));

    expect(data.map((d) => d.date)).toEqual(['2026-05-03', '2026-05-04']);

    // 03.05: başlangıca göre sıralı → a1 (10:00) sonra a2 (11:00)
    const day1 = data[0];
    expect(day1.events.map((e) => e.appointmentId)).toEqual(['a1', 'a2']);
    expect(day1.events[0].providerName).toBe('Dr. Ada');
    expect(day1.events[1].providerName).toBe('Dr. Bora');

    expect(data[1].events).toHaveLength(1);
    expect(data[1].events[0].appointmentId).toBe('a3');
  });

  it('directory dışı (pasif) doktor için providerName null döner', async () => {
    const rows = [row({ id: 'a1', providerId: 'ghost' })];
    const { data } = await run(build({ rows }));
    expect(data[0].events[0].providerName).toBeNull();
  });

  it('providerId verilince repo filtresine geçirir', async () => {
    let captured: unknown;
    const handler = build({
      rows: [],
      capture: (dto) => (captured = dto),
    });
    await run(handler, 'prov-2');
    expect(captured).toMatchObject({ clinicId: 'clinic-1', providerId: 'prov-2' });
  });

  it('yetki yoksa serializationOptions pasif döner (alan filtreleme transform interceptor katmanında yapılır)', async () => {
    const { meta } = await run(build({ rows: [], canAccess: false }));
    expect(meta?.serializationOptions?.isGroupActive).toBe(false);
    expect(meta?.serializationOptions?.groups).toEqual([]);
  });
});
