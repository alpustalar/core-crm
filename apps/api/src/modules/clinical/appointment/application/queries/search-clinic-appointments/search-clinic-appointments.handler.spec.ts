import { SearchClinicAppointmentsHandler } from './search-clinic-appointments.handler';
import { SearchClinicAppointmentsQuery } from './search-clinic-appointments.query';

/**
 * Resepsiyon araması. filter.clinicId'nin (query-param, zorunlu z.uuid()) repo'ya
 * iletildiği, diğer filtrelerin repo'ya geçtiği, sonucun (repo zaten plain read-model
 * döndüğü için toPersistence() gerekmeden) düz döndüğü ve serializationOptions'ın
 * policy'den alınıp meta'ya konduğu doğrulanır.
 */
describe('SearchClinicAppointmentsHandler (resepsiyon randevu arama)', () => {
  const pagination = {
    take: 20,
    skip: 0,
    limit: 20,
    page: 1,
    orderBy: 'asc' as const,
    orderByColumn: 'startTime',
    searchOperator: 'AND' as const,
  };

  const build = (options: {
    total?: number;
    items?: { id: string }[];
    canAccess?: boolean;
    capture?: (data: unknown) => void;
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
      searchClinicAppointments: jest.fn((data: unknown) => {
        options.capture?.(data);
        return Promise.resolve({
          items: options.items ?? [],
          total: options.total ?? 0,
        });
      }),
    } as never;

    const handler = new SearchClinicAppointmentsHandler(
      appointmentRepo,
      policyFactory
    );

    const ctx = { actor: { clinicId: 'clinic-1' } } as never;

    return { handler, ctx, appointmentRepo };
  };

  it('filter.clinicId’i ve diğer filtreleri repo’ya geçirir', async () => {
    let captured: Record<string, unknown> = {};
    const { handler, ctx } = build({
      items: [{ id: 'a1' }, { id: 'a2' }],
      total: 2,
      capture: (data) => (captured = data as Record<string, unknown>),
    });

    const { data, meta } = await handler.execute(
      new SearchClinicAppointmentsQuery(
        {
          pagination,
          clinicId: 'clinic-1',
          search: 'Ayşe',
          status: 'NOSHOW',
          providerId: 'prov-9',
          startDate: new Date('2026-05-01T00:00:00Z'),
          endDate: new Date('2026-05-31T23:59:00Z'),
        } as never,
        ctx
      )
    );

    expect(captured.clinicId).toBe('clinic-1');
    expect(captured).toMatchObject({
      search: 'Ayşe',
      status: 'NOSHOW',
      providerId: 'prov-9',
    });
    expect(data).toEqual([{ id: 'a1' }, { id: 'a2' }]);
    expect(meta?.pagination).toMatchObject({ total: 2, page: 1, limit: 20 });
  });

  it('serializationOptions’ı policy’den alıp meta’ya koyar', async () => {
    const { handler, ctx } = build({ items: [], total: 0 });

    const { meta } = await handler.execute(
      new SearchClinicAppointmentsQuery(
        { pagination, clinicId: 'clinic-1' } as never,
        ctx
      )
    );

    expect(meta?.serializationOptions).toEqual({
      isGroupActive: true,
      groups: ['INTERNAL'],
    });
  });

  it('yetki yoksa serializationOptions pasif döner (alan filtreleme transform interceptor katmanında yapılır)', async () => {
    const { handler, ctx } = build({ items: [], total: 0, canAccess: false });

    const { meta } = await handler.execute(
      new SearchClinicAppointmentsQuery(
        { pagination, clinicId: 'clinic-1' } as never,
        ctx
      )
    );

    expect(meta?.serializationOptions).toEqual({
      isGroupActive: false,
      groups: [],
    });
  });
});
