import { PatientBookAppointmentHandler } from './patient-book-appointment.handler';
import { PatientBookAppointmentCommand } from './patient-book-appointment.command';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';
import { MaxActiveBookingsExceededException } from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';

/**
 * Hasta booking: klinik ayarının uygulanması. maxActivePatientBookings sınırı aşımında
 * red; requireConfirmation'a göre randevunun PENDING vs CONFIRMED doğması.
 */
describe('PatientBookAppointmentHandler (klinik ayarı: maxActive + requireConfirmation)', () => {
  const CLINIC = '11111111-1111-4111-8111-111111111111';
  const PROVIDER = '33333333-3333-4333-8333-333333333333';
  const PATIENT = '44444444-4444-4444-8444-444444444444';

  const futureStart = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const patient = {
    patientId: PATIENT,
    firstName: 'Ayşe Yılmaz',
    phone: '+905551112233',
    email: null,
  };

  const dto = {
    clinicId: CLINIC,
    providerId: PROVIDER,
    startTime: futureStart,
    duration: 30,
    isConsultation: false,
  };

  const build = (options: {
    activeCount?: number;
    maxActivePatientBookings?: number;
    requireConfirmation?: boolean;
    createCapture?: (status: string) => void;
  }) => {
    const settings = {
      allowPatientBooking: true,
      maxFutureBookingDays: 365,
      maxActivePatientBookings: options.maxActivePatientBookings ?? 3,
      requireConfirmation: options.requireConfirmation ?? false,
    };

    const createSpy = jest.fn(
      (appt: { id: { value: string }; status: string }) => {
        options.createCapture?.(appt.status);
        return Promise.resolve({ id: { value: 'apt-1' } });
      }
    );
    // countActiveByPatient artık command repo'da (query repo command handler'dan kaldırıldı).
    const appointmentCommandRepo = {
      create: createSpy,
      countActiveByPatient: jest.fn(() =>
        Promise.resolve(options.activeCount ?? 0)
      ),
    } as never;

    const appointmentCheckerService = {
      assertNoConflict: jest.fn(() => Promise.resolve()),
    } as never;

    // Klinik/hekim uygunluk kontrolü artık bus üzerinden değil, sahibinin domain
    // servisi üzerinden (assert* → void ya da DomainException).
    const clinicBookingService = {
      assertCanBook: jest.fn(() => Promise.resolve()),
    } as never;

    const providerBookingService = {
      assertCanBook: jest.fn(() => Promise.resolve()),
    } as never;

    const queryBus = {
      execute: jest.fn((q: unknown) => {
        if (q instanceof GetClinicAppointmentSettingsQuery)
          return Promise.resolve({ data: settings });
        throw new Error('beklenmeyen query');
      }),
    } as never;

    const transactionManager = {
      run: (cb: () => Promise<unknown>) => cb(),
    } as never;

    return {
      handler: new PatientBookAppointmentHandler(
        appointmentCommandRepo,
        appointmentCheckerService,
        providerBookingService,
        clinicBookingService,
        queryBus,
        transactionManager
      ),
      createSpy,
    };
  };

  it('aktif randevu sınırı dolmuşsa MaxActiveBookingsExceededException fırlatır', async () => {
    const { handler, createSpy } = build({
      activeCount: 3,
      maxActivePatientBookings: 3,
    });

    await expect(
      handler.execute(
        new PatientBookAppointmentCommand({
          data: dto as never,
          ctx: {} as never,
          aiConversationPatient: patient as never,
        })
      )
    ).rejects.toBeInstanceOf(MaxActiveBookingsExceededException);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('requireConfirmation=false ise randevu CONFIRMED doğar', async () => {
    let status = '';
    const { handler } = build({
      requireConfirmation: false,
      createCapture: (s) => (status = s),
    });

    await handler.execute(
      new PatientBookAppointmentCommand({
        data: dto as never,
        ctx: {} as never,
        aiConversationPatient: patient as never,
      })
    );

    expect(status).toBe('CONFIRMED');
  });

  it('requireConfirmation=true ise randevu PENDING doğar', async () => {
    let status = '';
    const { handler } = build({
      requireConfirmation: true,
      createCapture: (s) => (status = s),
    });

    await handler.execute(
      new PatientBookAppointmentCommand({
        data: dto as never,
        ctx: {} as never,
        aiConversationPatient: patient as never,
      })
    );

    expect(status).toBe('PENDING');
  });
});
