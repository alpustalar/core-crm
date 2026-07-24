import { UpdateClinicAppointmentSettingsHandler } from './update-clinic-appointment-settings.handler';
import { UpdateClinicAppointmentSettingsCommand } from './update-clinic-appointment-settings.command';

describe('UpdateClinicAppointmentSettingsHandler (ayar güncelleme)', () => {
  const CLINIC = '11111111-1111-4111-8111-111111111111';
  const ctx = { actor: { clinicId: CLINIC } } as any;

  const build = (options: {
    existing?: { update: jest.Mock } | null;
    canAccess?: boolean;
  }) => {
    const canAccess = options.canAccess ?? true;
    const executionOrder: string[] = [];

    const settingsQueryRepo = {
      findByClinicId: jest.fn(() => Promise.resolve(options.existing ?? null)),
    } as any;

    // Gerçek sıralamayı yakalamak için spy'ların tetiklenme anını logluyoruz
    const saveSpy = jest.fn().mockImplementation(() => {
      executionOrder.push('save');
      return Promise.resolve();
    });
    const settingsCommandRepo = { save: saveSpy } as any;

    const policyFactory = {
      clinic: jest.fn().mockReturnValue({
        evaluator: {
          check: jest.fn().mockReturnValue({
            orThrow: () => {
              if (!canAccess) throw new Error('yetki yok');
            },
          }),
        },
      }),
    } as any;

    const deleteSpy = jest.fn().mockImplementation(() => {
      executionOrder.push('bust');
      return Promise.resolve();
    });
    const redis = { deleteClinicAppointmentSettings: deleteSpy } as any;

    // txManager artık sadece callback'i güvenle yürüten şeffaf bir katman
    const txManager = {
      run: jest.fn().mockImplementation((cb: () => Promise<unknown>) => cb()),
    } as any;

    return {
      handler: new UpdateClinicAppointmentSettingsHandler(
        settingsQueryRepo,
        settingsCommandRepo,
        policyFactory,
        redis,
        txManager
      ),
      saveSpy,
      deleteSpy,
      executionOrder,
    };
  };

  it('mevcut satırı yükler, update+save eder ve cache’i bust eder (bust kesinlikle save’den sonra)', async () => {
    const updateSpy = jest.fn();
    const { handler, saveSpy, deleteSpy, executionOrder } = build({
      existing: { update: updateSpy },
    });
    const dto = { staffAllowOverbooking: false, slotDurationMinutes: 20 };

    await handler.execute(
      new UpdateClinicAppointmentSettingsCommand({
        clinicId: CLINIC,
        data: dto as any,
        ctx,
      })
    );

    expect(updateSpy).toHaveBeenCalledWith(dto);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(CLINIC);

    // Sıralama artık tamamen garanti altında
    expect(executionOrder).toEqual(['save', 'bust']);
  });

  it('satır yoksa default’tan üretip yine kaydeder ve cache bust eder', async () => {
    const { handler, saveSpy, deleteSpy } = build({ existing: null });

    await handler.execute(
      new UpdateClinicAppointmentSettingsCommand({
        clinicId: CLINIC,
        data: { staffAllowOverbooking: false } as any,
        ctx,
      })
    );

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });

  it('yetki yoksa hata fırlatır ve hiçbir yan etki (save/bust) oluşturmaz', async () => {
    const { handler, saveSpy, deleteSpy } = build({ canAccess: false });

    await expect(
      handler.execute(
        new UpdateClinicAppointmentSettingsCommand({
          clinicId: CLINIC,
          data: {} as any,
          ctx,
        })
      )
    ).rejects.toThrow('yetki yok');

    expect(saveSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
