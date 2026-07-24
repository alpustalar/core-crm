/* eslint-disable */
import { GetUpcomingRemindersHandler } from './get-upcoming-reminders.handler';
import { GetUpcomingRemindersQuery } from './get-upcoming-reminders.query';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';

describe('GetUpcomingRemindersHandler (yaklaşan hatırlatmalar)', () => {
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
    canAccess?: boolean;
    capture?: (data: unknown) => void;
    clinicId?: string | null;
  }) => {
    const canAccess = options.canAccess ?? true;

    // Yetki mekanizmasını gerçeğe daha yakın mock'luyoruz
    const policyFactory = {
      appointment: jest.fn().mockReturnValue({
        evaluator: {
          check: jest.fn().mockReturnValue({
            orThrow: () => {
              if (!canAccess) throw new Error('yetki yok');
            },
          }),
        },
      }),
    } as any;

    const appointmentRepo = {
      findUpcomingReminders: jest.fn().mockImplementation((data: unknown) => {
        options.capture?.(data);
        return Promise.resolve({
          items: [{ toPersistence: () => ({ id: 'a1' }) }],
          total: 1,
        });
      }),
    } as any;

    const ctx = {
      actor: {
        clinicId:
          options.clinicId !== undefined ? options.clinicId : 'clinic-1',
      },
    } as any;

    return {
      handler: new GetUpcomingRemindersHandler(appointmentRepo),
      ctx,
    };
  };

  it('clinicId ve hoursAhead’i repo filtresine geçirir', async () => {
    let captured: Record<string, unknown> = {};
    const { handler, ctx } = build({
      capture: (data) => (captured = data as Record<string, unknown>),
    });

    const { data } = await handler.execute(
      new GetUpcomingRemindersQuery({ pagination, hoursAhead: 48 } as any, ctx)
    );

    expect(captured).toMatchObject({ clinicId: 'clinic-1', hoursAhead: 48 });
    expect(data).toEqual([{ id: 'a1' }]);
  });

  it('klinik atanmamışsa ClinicNotAssignedException fırlatır', async () => {
    // Hem null hem undefined durumlarını handle edebildiğini doğrulamak için null set ediyoruz
    const { handler, ctx } = build({ clinicId: null });

    await expect(
      handler.execute(
        new GetUpcomingRemindersQuery(
          { pagination, hoursAhead: 24 } as any,
          ctx
        )
      )
    ).rejects.toBeInstanceOf(ClinicNotAssignedException);
  });

  it('yetki yoksa hata fırlatır', async () => {
    const { handler, ctx } = build({ canAccess: false });

    await expect(
      handler.execute(
        new GetUpcomingRemindersQuery(
          { pagination, hoursAhead: 24 } as any,
          ctx
        )
      )
    ).rejects.toThrow('yetki yok');
  });
});
