import { StaffRescheduleHandler } from './staff-reschedule.handler';
import { StaffRescheduleCommand } from './staff-reschedule.command';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';

/**
 * Personel yeniden zamanlama: overbooking davranışının klinik ayarına (staffAllowOverbooking)
 * bağlı olması. false → çakışma kontrolü (randevunun kendisi hariç); true → kontrol yok.
 */
describe('StaffRescheduleHandler (staffAllowOverbooking)', () => {
  const CLINIC = '11111111-1111-4111-8111-111111111111';
  const PROVIDER = '33333333-3333-4333-8333-333333333333';

  const build = (staffAllowOverbooking: boolean) => {
    const appointment = {
      clinicId: { value: CLINIC },
      providerId: { value: PROVIDER },
      reschedule: jest.fn(),
      rules: () => ({
        reschedule: () => ({ orThrow: () => undefined }),
      }),
    };

    const appointmentCommandRepo = {
      findById: jest.fn(() => Promise.resolve(appointment)),
      update: jest.fn(() => Promise.resolve()),
    } as never;

    const policyFactory = {
      appointment: () => ({
        evaluator: {
          check: () => ({ orThrow: () => undefined }),
        },
      }),
      entity: () => ({
        policy: { getValidateOptions: () => ({}) },
      }),
    } as never;

    const assertNoConflict = jest.fn(() => Promise.resolve());
    const appointmentCheckerService = { assertNoConflict } as never;

    const queryBus = {
      execute: jest.fn((q: unknown) => {
        if (q instanceof GetClinicAppointmentSettingsQuery)
          return Promise.resolve({ data: { staffAllowOverbooking } });
        throw new Error('beklenmeyen query');
      }),
    } as never;

    const txManager = {
      run: (cb: () => Promise<unknown>) => cb(),
    } as never;

    return {
      handler: new StaffRescheduleHandler(
        appointmentCommandRepo,
        policyFactory,
        appointmentCheckerService,
        queryBus,
        txManager
      ),
      assertNoConflict,
      appointment,
    };
  };

  const dto = {
    appointmentId: 'apt-1',
    startTime: new Date('2026-05-03T09:00:00Z'),
    duration: 30,
  };

  it('overbooking kapalı: çakışma kontrolü randevunun kendisi hariç çağrılır', async () => {
    const { handler, assertNoConflict, appointment } = build(false);

    await handler.execute(
      new StaffRescheduleCommand(
        dto as never,
        { actor: {}, source: 'STAFF' } as never
      )
    );

    expect(assertNoConflict).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: PROVIDER,
        ignoreAppointmentId: 'apt-1',
      })
    );
    expect(appointment.reschedule).toHaveBeenCalledTimes(1);
  });

  it('overbooking açık: çakışma kontrolü YAPILMAZ', async () => {
    const { handler, assertNoConflict } = build(true);

    await handler.execute(
      new StaffRescheduleCommand(
        dto as never,
        { actor: {}, source: 'STAFF' } as never
      )
    );

    expect(assertNoConflict).not.toHaveBeenCalled();
  });
});
