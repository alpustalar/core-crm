import { ScheduleAppointmentHandler } from './schedule-appointment.handler';
import { ScheduleAppointmentCommand } from './schedule-appointment.command';
import { FindPatientByIdQuery } from '@modules/crm/patient/application/queries/find-patient-by-id/find-patient-by-id.query';
import { CreatePatientCommand } from '@modules/crm/patient/application/commands/create-patient/create-patient.command';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';

/**
 * Personel randevu oluşturma. Odak: walk-in (patientId yok) durumunda hasta kaydının
 * CreatePatientCommand ile açılması; mevcut hasta seçilince YENİ kayıt açılmaması; ve
 * çakışma davranışının klinik ayarına (staffAllowOverbooking) bağlı olması —
 * true=overbooking serbest (çakışma kontrolü YOK), false=çakışma engellenir.
 */
describe('ScheduleAppointmentHandler (walk-in + overbooking ayarı)', () => {
  const CLINIC = '11111111-1111-4111-8111-111111111111';
  const ORG = '22222222-2222-4222-8222-222222222222';
  const PROVIDER = '33333333-3333-4333-8333-333333333333';
  const NEW_PATIENT = '44444444-4444-4444-8444-444444444444';
  const EXISTING_PATIENT = '55555555-5555-4555-8555-555555555555';

  const ctx = {
    actor: { clinicId: CLINIC, organizationId: ORG, userId: 'user-9' },
  } as never;

  // startTime her zaman gelecekte (Appointment.schedule geçmiş tarihi reddeder).
  const futureStart = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const build = (options: {
    patient?: unknown | null;
    staffAllowOverbooking?: boolean;
    assertNoConflict?: jest.Mock;
  }) => {
    const createPatientSpy = jest.fn(() => Promise.resolve(NEW_PATIENT));
    const assertNoConflict =
      options.assertNoConflict ?? jest.fn(() => Promise.resolve());

    const commandBus = {
      execute: jest.fn((cmd: unknown) => {
        if (cmd instanceof CreatePatientCommand) return createPatientSpy();
        throw new Error('beklenmeyen command');
      }),
    } as never;

    const queryBus = {
      execute: jest.fn((q: unknown) => {
        if (q instanceof FindPatientByIdQuery)
          return Promise.resolve({ data: options.patient ?? null });
        if (q instanceof GetClinicAppointmentSettingsQuery)
          return Promise.resolve({
            data: { staffAllowOverbooking: options.staffAllowOverbooking ?? true },
          });
        throw new Error('beklenmeyen query');
      }),
    } as never;

    const appointmentRepo = {
      create: jest.fn((appt: { id: { value: string } }) =>
        Promise.resolve({ id: { value: appt.id.value } })
      ),
    } as never;

    const policyFactory = {
      appointment: () => ({
        evaluator: { check: () => ({ orThrow: () => undefined }) },
      }),
      entity: () => ({
        policy: { getValidateOptions: () => ({}) },
      }),
    } as never;

    const appointmentCheckerService = { assertNoConflict } as never;

    const tenantScopeResolver = {
      resolve: jest.fn().mockResolvedValue('org-1'),
    } as never;

    const transactionManager = {
      run: (cb: () => Promise<unknown>) => cb(),
    } as never;

    return {
      handler: new ScheduleAppointmentHandler(
        appointmentRepo,
        policyFactory,
        appointmentCheckerService,
        tenantScopeResolver,
        queryBus,
        commandBus,
        transactionManager
      ),
      createPatientSpy,
      assertNoConflict,
    };
  };

  const walkInDto = {
    patientName: 'Ayşe Yılmaz',
    patientPhone: '+905551112233',
    providerId: PROVIDER,
    startTime: futureStart,
    duration: 30,
    isConsultation: false,
    clinicId: CLINIC,
    organizationId: ORG,
  };

  it('walk-in (patientId yok): telefonla hasta kaydı açar', async () => {
    const { handler, createPatientSpy } = build({ patient: null });

    const id = await handler.execute(
      new ScheduleAppointmentCommand(walkInDto as never, ctx)
    );

    expect(createPatientSpy).toHaveBeenCalledTimes(1);
    expect(typeof id).toBe('string');
  });

  it('mevcut hasta seçiliyse yeni kayıt AÇMAZ', async () => {
    const { handler, createPatientSpy } = build({
      patient: {
        firstName: 'Mevcut',
        lastName: 'Hasta',
        phone: '+905550000000',
        email: null,
      },
    });

    await handler.execute(
      new ScheduleAppointmentCommand(
        { ...walkInDto, patientId: EXISTING_PATIENT } as never,
        ctx
      )
    );

    expect(createPatientSpy).not.toHaveBeenCalled();
  });

  it('overbooking açık (varsayılan): çakışma kontrolü YAPILMAZ', async () => {
    const { handler, assertNoConflict } = build({ staffAllowOverbooking: true });

    await handler.execute(new ScheduleAppointmentCommand(walkInDto as never, ctx));

    expect(assertNoConflict).not.toHaveBeenCalled();
  });

  it('overbooking kapalı: çakışma kontrolü yapılır ve çakışma varsa engellenir', async () => {
    const assertNoConflict = jest.fn(() => {
      throw new Error('SLOT_CONFLICT');
    });
    const { handler } = build({
      staffAllowOverbooking: false,
      assertNoConflict,
    });

    await expect(
      handler.execute(new ScheduleAppointmentCommand(walkInDto as never, ctx))
    ).rejects.toThrow('SLOT_CONFLICT');
    expect(assertNoConflict).toHaveBeenCalledTimes(1);
  });
});
