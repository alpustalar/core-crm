/* eslint-disable */
import { GetUpcomingRemindersHandler } from './get-upcoming-reminders.handler';
import { GetUpcomingRemindersQuery } from './get-upcoming-reminders.query';

/**
 * NOT: Bu handler'ın kurucusu yalnızca appointmentRepo alır — policyFactory inject
 * edilmez ve ctx (aktör) hiç kullanılmaz. clinicId, ctx.actor.clinicId'den değil
 * doğrudan filter.clinicId'den (DTO/query-param — GetUpcomingRemindersSchema'da
 * zorunlu z.uuid()) okunur. Dolayısıyla "klinik atanmamışsa" / "yetki yoksa"
 * senaryoları bu handler seviyesinde değil, DTO validasyonu ve üst katman (guard)
 * seviyesinde uygulanır; burada yalnız filtrenin repo'ya doğru geçtiği doğrulanır.
 */
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

  const build = (options: { capture?: (data: unknown) => void }) => {
    const appointmentRepo = {
      findUpcomingReminders: jest.fn().mockImplementation((data: unknown) => {
        options.capture?.(data);
        // Repo bu projeksiyonda plain read-model (@shared Appointment) döner —
        // domain entity değil; handler ekstra toPersistence() dönüşümü yapmaz.
        return Promise.resolve({
          items: [{ id: 'a1' }],
          total: 1,
        });
      }),
    } as any;

    const ctx = { actor: { clinicId: 'clinic-1' } } as any;

    return {
      handler: new GetUpcomingRemindersHandler(appointmentRepo),
      ctx,
    };
  };

  it('filter.clinicId ve hoursAhead’i repo filtresine geçirir', async () => {
    let captured: Record<string, unknown> = {};
    const { handler, ctx } = build({
      capture: (data) => (captured = data as Record<string, unknown>),
    });

    const { data } = await handler.execute(
      new GetUpcomingRemindersQuery(
        { pagination, hoursAhead: 48, clinicId: 'clinic-1' } as any,
        ctx
      )
    );

    expect(captured).toMatchObject({ clinicId: 'clinic-1', hoursAhead: 48 });
    expect(data).toEqual([{ id: 'a1' }]);
  });

  it('sayfalama meta’sını repo’dan dönen total ile hesaplar', async () => {
    const { handler, ctx } = build({});

    const { meta } = await handler.execute(
      new GetUpcomingRemindersQuery(
        { pagination, hoursAhead: 24, clinicId: 'clinic-1' } as any,
        ctx
      )
    );

    expect(meta?.pagination).toMatchObject({ total: 1 });
  });
});
