import { GetClinicDailySummaryHandler } from './get-clinic-daily-summary.handler';
import { GetClinicDailySummaryQuery } from './get-clinic-daily-summary.query';
import { GetClinicTimezoneQuery } from '@modules/organization/clinic/application/queries/get-clinic-timezone/get-clinic-timezone.query';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ClinicStatusCount } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';

/**
 * Resepsiyon günlük özeti. status sayımlarının düz özete katlandığı (eksik status = 0),
 * gün sınırlarının klinik saat dilimiyle hesaplanıp repo'ya geçtiği, klinik atanmama ve
 * yetki reddi doğrulanır.
 */
describe('GetClinicDailySummaryHandler (günlük özet)', () => {
  const build = (options: {
    counts?: ClinicStatusCount[];
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
      countClinicAppointmentsByStatus: jest.fn((data: unknown) => {
        options.capture?.(data);
        return Promise.resolve(options.counts ?? []);
      }),
    } as never;

    const queryBus = {
      execute: jest.fn((q: unknown) => {
        if (q instanceof GetClinicTimezoneQuery) {
          return Promise.resolve({ data: 'Europe_Istanbul' });
        }
        throw new Error('beklenmeyen query');
      }),
    } as unknown as TSQueryBus;

    const ctx = {
      actor: {
        clinicId:
          options.clinicId === undefined ? 'clinic-1' : options.clinicId,
      },
    } as never;

    return {
      handler: new GetClinicDailySummaryHandler(
        appointmentRepo,
        policyFactory,
        queryBus
      ),
      ctx,
    };
  };

  it('status sayımlarını düz özete katlar (eksik status 0)', async () => {
    let captured: Record<string, unknown> = {};
    const { handler, ctx } = build({
      counts: [
        { status: 'CONFIRMED', count: 5 },
        { status: 'PENDING', count: 2 },
        { status: 'NOSHOW', count: 1 },
      ],
      capture: (data) => (captured = data as Record<string, unknown>),
    });

    const { data } = await handler.execute(
      new GetClinicDailySummaryQuery(
        { date: new Date('2026-05-03T00:00:00Z') } as never,
        ctx
      )
    );

    expect(data).toMatchObject({
      total: 8,
      pending: 2,
      confirmed: 5,
      cancelled: 0,
      completed: 0,
      noShow: 1,
    });
    // Gün sınırları klinik yerelinde hesaplanıp repo'ya geçirilmeli.
    expect(captured.clinicId).toBe('clinic-1');
    expect(captured.dayStart).toBeInstanceOf(Date);
    expect(captured.dayEnd).toBeInstanceOf(Date);
  });

  it('klinik atanmamışsa ClinicNotAssignedException fırlatır', async () => {
    const { handler, ctx } = build({ clinicId: null });
    await expect(
      handler.execute(
        new GetClinicDailySummaryQuery(
          { date: new Date('2026-05-03T00:00:00Z') } as never,
          ctx
        )
      )
    ).rejects.toBeInstanceOf(ClinicNotAssignedException);
  });

  it('yetki yoksa hata fırlatır', async () => {
    const { handler, ctx } = build({ canAccess: false });
    await expect(
      handler.execute(
        new GetClinicDailySummaryQuery(
          { date: new Date('2026-05-03T00:00:00Z') } as never,
          ctx
        )
      )
    ).rejects.toThrow('yetki yok');
  });
});
