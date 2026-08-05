import { CheckInAppointmentHandler } from './check-in-appointment.handler';
import { CheckInAppointmentCommand } from './check-in-appointment.command';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

/**
 * Check-in handler'ı. Kaydın yüklendiği, yetkinin denetlendiği, domain metodunun
 * (checkIn) çağrılıp update edildiği, kayıt yoksa NotFound fırlatıldığı doğrulanır.
 */
describe('CheckInAppointmentHandler (hasta girişi / ARRIVED)', () => {
  const ctx = { actor: { clinicId: 'clinic-1' } } as never;

  const build = (options: {
    found?: boolean;
    canAccess?: boolean;
    checkInSpy?: jest.Mock;
  }) => {
    const found = options.found ?? true;
    const canAccess = options.canAccess ?? true;
    const checkInSpy = options.checkInSpy ?? jest.fn();
    const saveSpy = jest.fn(() => Promise.resolve());

    const appointment = {
      clinicId: { value: 'clinic-1' },
      checkIn: checkInSpy,
      rules: () => ({ checkIn: { orThrow: () => undefined } }),
    };

    const appointmentCommandRepo = {
      findById: jest.fn(() => Promise.resolve(found ? appointment : null)),
      update: saveSpy,
    } as never;

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
      entity: () => ({
        policy: {
          getValidateOptions: () => ({}),
        },
      }),
    } as never;

    const txManager = { run: (cb: () => Promise<unknown>) => cb() } as never;

    return {
      handler: new CheckInAppointmentHandler(
        appointmentCommandRepo,
        policyFactory,
        txManager
      ),
      checkInSpy,
      saveSpy,
    };
  };

  it('kaydı yükler, checkIn çağırır ve update eder', async () => {
    const { handler, checkInSpy, saveSpy } = build({});
    await handler.execute(new CheckInAppointmentCommand('apt-1', ctx));
    expect(checkInSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it('kayıt yoksa AppointmentNotFoundException fırlatır', async () => {
    const { handler, saveSpy } = build({ found: false });
    await expect(
      handler.execute(new CheckInAppointmentCommand('yok', ctx))
    ).rejects.toBeInstanceOf(AppointmentNotFoundException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('yetki yoksa hata fırlatır (update yok)', async () => {
    const { handler, saveSpy } = build({ canAccess: false });
    await expect(
      handler.execute(new CheckInAppointmentCommand('apt-1', ctx))
    ).rejects.toThrow('yetki yok');
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
