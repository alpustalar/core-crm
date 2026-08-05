import { UpdateAppointmentDetailsHandler } from './update-appointment-details.handler';
import { UpdateAppointmentDetailsCommand } from './update-appointment-details.command';
import { AppointmentNotFoundException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

/**
 * Detay düzenleme handler'ı. Kaydın yüklendiği, yetkinin kaydın kliniğine göre
 * denetlendiği, domain metodunun (updateDetails) verilen alanlarla çağrıldığı,
 * update edildiği ve kayıt yoksa NotFound fırlatıldığı doğrulanır.
 */
describe('UpdateAppointmentDetailsHandler (randevu detay düzenleme)', () => {
  const ctx = { actor: { clinicId: 'clinic-1' }, source: 'STAFF' } as never;

  const build = (options: {
    found?: boolean;
    canAccess?: boolean;
    updateSpy?: jest.Mock;
    saveSpy?: jest.Mock;
  }) => {
    const found = options.found ?? true;
    const canAccess = options.canAccess ?? true;
    const updateSpy = options.updateSpy ?? jest.fn();
    const saveSpy = options.saveSpy ?? jest.fn(() => Promise.resolve());

    const appointment = {
      clinicId: { value: 'clinic-1' },
      updateDetails: updateSpy,
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
    } as never;

    const txManager = {
      run: (cb: () => Promise<unknown>) => cb(),
    } as never;

    return {
      handler: new UpdateAppointmentDetailsHandler(
        appointmentCommandRepo,
        policyFactory,
        txManager
      ),
      updateSpy,
      saveSpy,
    };
  };

  it('kaydı yükler, updateDetails’i dto ile çağırır ve update eder', async () => {
    const { handler, updateSpy, saveSpy } = build({});
    const dto = { notes: 'Tekerlekli sandalye', patientPhone: '+905551112233' };

    await handler.execute(
      new UpdateAppointmentDetailsCommand({
        appointmentId: 'apt-1',
        data: dto as never,
        ctx,
      })
    );

    expect(updateSpy).toHaveBeenCalledWith(dto);
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it('kayıt yoksa AppointmentNotFoundException fırlatır', async () => {
    const { handler, saveSpy } = build({ found: false });
    await expect(
      handler.execute(
        new UpdateAppointmentDetailsCommand({
          appointmentId: 'yok',
          data: {} as never,
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(AppointmentNotFoundException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('yetki yoksa hata fırlatır (update edilmez)', async () => {
    const { handler, saveSpy } = build({ canAccess: false });
    await expect(
      handler.execute(
        new UpdateAppointmentDetailsCommand({
          appointmentId: 'apt-1',
          data: {} as never,
          ctx,
        })
      )
    ).rejects.toThrow('yetki yok');
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
