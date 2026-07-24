import { SearchClinicAppointmentsHandler } from './search-clinic-appointments.handler';
import { SearchClinicAppointmentsQuery } from './search-clinic-appointments.query';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';

/**
 * Resepsiyon araması. Aramanın aktörün kliniğine sabitlendiği (dto'da clinicId yok),
 * filtrelerin repo'ya iletildiği, entity → toPersistence dönüşümü, klinik atanmama ve
 * yetki reddi doğrulanır.
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

  const entity = (id: string) => ({
    toPersistence: () => ({ id }),
  });

  const build = (options: {
    total?: number;
    items?: { toPersistence: () => { id: string } }[];
    canAccess?: boolean;
    capture?: (data: unknown) => void;
    clinicId?: string | null;
  }) => {
    const canAccess = options.canAccess ?? true;

    const policyFactory = {
      appointment: () => ({
        evaluator: {
          check: () => ({
            orThrow: () => {
              if (!canAccess) throw new Error('yetki yok');
            },
          }),
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

    const ctx = {
      actor: {
        clinicId:
          options.clinicId === undefined ? 'clinic-1' : options.clinicId,
      },
    } as never;

    return { handler, ctx, appointmentRepo };
  };

  it('aramayı aktörün kliniğine sabitler ve filtreleri repo’ya geçirir', async () => {
    let captured: Record<string, unknown> = {};
    const { handler, ctx } = build({
      items: [entity('a1'), entity('a2')],
      total: 2,
      capture: (data) => (captured = data as Record<string, unknown>),
    });

    const { data, meta } = await handler.execute(
      new SearchClinicAppointmentsQuery(
        {
          pagination,
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

  it('klinik atanmamışsa ClinicNotAssignedException fırlatır', async () => {
    const { handler, ctx } = build({ clinicId: null });
    await expect(
      handler.execute(
        new SearchClinicAppointmentsQuery({ pagination } as never, ctx)
      )
    ).rejects.toBeInstanceOf(ClinicNotAssignedException);
  });

  it('yetki yoksa hata fırlatır', async () => {
    const { handler, ctx } = build({ canAccess: false });
    await expect(
      handler.execute(
        new SearchClinicAppointmentsQuery({ pagination } as never, ctx)
      )
    ).rejects.toThrow('yetki yok');
  });
});
