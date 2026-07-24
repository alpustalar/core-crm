import { ProcessAppointmentRemindersHandler } from './process-appointment-reminders.handler';
import { DateTimeManager } from '@common/utils';

/**
 * Hatırlatma motoru handler'ı. Geniş pencerede çekilen randevular klinik-başına
 * `sendSmsReminderHours` penceresine göre elenir; penceredekiler markReminderSent
 * + save alır (dedup), penceredeki değil/ayar kapalı olanlar atlanır.
 */
describe('ProcessAppointmentRemindersHandler (hatırlatma motoru)', () => {
  const CLINIC_A = '11111111-1111-4111-8111-111111111111';

  const makeAppointment = (startTime: Date) => {
    const markReminderSent = jest.fn();
    return {
      entity: {
        id: { value: 'apt-1' },
        clinicId: { value: CLINIC_A },
        startTime,
        markReminderSent,
      },
      markReminderSent,
    };
  };

  const build = (params: {
    due: unknown[];
    sendSmsReminderHours: number;
    requireReminderResponse?: boolean;
  }) => {
    const findDueForReminder = jest.fn(() => Promise.resolve(params.due));
    const save = jest.fn(() => Promise.resolve());
    const execute = jest.fn(() =>
      Promise.resolve({
        data: {
          sendSmsReminderHours: params.sendSmsReminderHours,
          requireReminderResponse: params.requireReminderResponse ?? false,
        },
      })
    );

    // findDueForReminder artık command repo'da (CQRS: mutasyona beslenen okuma).
    const commandRepo = { findDueForReminder, save } as never;
    const queryBus = { execute } as never;
    const txManager = {
      run: (cb: () => Promise<unknown>) => cb(),
    } as never;

    return {
      handler: new ProcessAppointmentRemindersHandler(
        commandRepo,
        queryBus,
        txManager
      ),
      save,
      execute,
    };
  };

  it('pencereye giren randevuyu işaretler ve kaydeder', async () => {
    // 24 saat sonrası, ayar 48 saat → penceredeler (startTime <= now+48h).
    const start = DateTimeManager.addHours(DateTimeManager.create(), 24);
    const { entity, markReminderSent } = makeAppointment(start);
    const { handler, save } = build({
      due: [entity],
      sendSmsReminderHours: 48,
      requireReminderResponse: true,
    });

    await handler.execute();

    expect(markReminderSent).toHaveBeenCalledWith(true);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('pencere dışındaki (çok ileri) randevuyu atlar', async () => {
    // 72 saat sonrası, ayar 24 saat → henüz pencerede değil.
    const start = DateTimeManager.addHours(DateTimeManager.create(), 72);
    const { entity, markReminderSent } = makeAppointment(start);
    const { handler, save } = build({
      due: [entity],
      sendSmsReminderHours: 24,
    });

    await handler.execute();

    expect(markReminderSent).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('hatırlatma kapalıysa (0 saat) atlar', async () => {
    const start = DateTimeManager.addHours(DateTimeManager.create(), 2);
    const { entity, markReminderSent } = makeAppointment(start);
    const { handler, save } = build({
      due: [entity],
      sendSmsReminderHours: 0,
    });

    await handler.execute();

    expect(markReminderSent).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('taranacak randevu yoksa ayar bile sorulmaz (erken çıkış)', async () => {
    const { handler, save, execute } = build({
      due: [],
      sendSmsReminderHours: 24,
    });

    await handler.execute();

    expect(execute).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});
