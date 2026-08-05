import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PatientBookAppointmentCommand } from './patient-book-appointment.command';
import { AppointmentCheckerService } from '@modules/clinical/appointment/domain/services/appointment-checker.service';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

import { Appointment } from '@modules/clinical/appointment/domain/entities/appointment.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TimeZoneSchema } from '@shared';
import { AssertClinicCanBookQuery } from '@modules/organization/clinic/application/queries/assert-clinic-can-book/assert-clinic-can-book.query';
import { AssertProviderCanBookQuery } from '@modules/clinical/provider/application/queries/assert-provider-can-book/assert-provider-can-book.query';
import { AppointmentSourceSchema } from '@input-type-schemas/AppointmentSourceSchema';
import { AppointmentCreatorTypeSchema } from '@input-type-schemas/AppointmentCreatorTypeSchema';
import { AppointmentStatusSchema } from '@input-type-schemas/AppointmentStatusSchema';
import { GetClinicAppointmentSettingsQuery } from '@modules/organization/clinic/application/queries/get-clinic-appointment-settings/get-clinic-appointment-settings.query';
import {
  BookingWindowExceededException,
  MaxActiveBookingsExceededException,
  PatientBookingDisabledException,
} from '@modules/clinical/appointment/domain/exceptions/appointment.exceptions';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import {
  APPOINTMENT_COMMAND_REPOSITORY,
  IAppointmentCommandRepository,
} from '@modules/clinical/appointment/domain/repositories/appointment';

@CommandHandler(PatientBookAppointmentCommand)
export class PatientBookAppointmentHandler implements ICommandHandler<
  PatientBookAppointmentCommand,
  string
> {
  constructor(
    @Inject(APPOINTMENT_COMMAND_REPOSITORY)
    private readonly appointmentRepo: IAppointmentCommandRepository,
    private readonly appointmentCheckerService: AppointmentCheckerService,
    private readonly queryBus: TSQueryBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: PatientBookAppointmentCommand): Promise<string> {
    const { data, ctx, aiConversationPatient } = command.payload;

    const patient = aiConversationPatient ?? command.payload.ctx.actor;

    const {
      clinicId,
      providerId,
      startTime,
      duration,
      endTime: dataEndTime,
      treatmentId,
      notes,
      isConsultation,
    } = data;

    const endTime = Appointment.calculateEndTime({
      startTime,
      endTime: dataEndTime,
      duration,
    }).orThrow();

    // Klinik ayarı: hasta panelden randevu açabiliyor mu + en ileri tarih sınırı.
    // Satır yoksa DB default'ları (booking açık, 90 gün) geçerlidir.
    const { data: settings } = await this.queryBus.execute(
      new GetClinicAppointmentSettingsQuery(clinicId)
    );

    if (!settings.allowPatientBooking) {
      throw new PatientBookingDisabledException();
    }

    if (
      DateTimeManager.diffInDays(startTime, DateTimeManager.create()) >
      settings.maxFutureBookingDays
    ) {
      throw new BookingWindowExceededException(settings.maxFutureBookingDays);
    }

    // Hasta aynı anda en fazla kaç aktif randevu tutabilir (klinik ayarı) — aşımda reddet.
    const activeCount = await this.appointmentRepo.countActiveByPatient(
      patient.patientId
    );

    if (activeCount >= settings.maxActivePatientBookings) {
      throw new MaxActiveBookingsExceededException(
        settings.maxActivePatientBookings
      );
    }

    await Promise.all([
      this.queryBus.execute(
        new AssertClinicCanBookQuery({ clinicId, startTime, endTime })
      ),
      this.queryBus.execute(
        new AssertProviderCanBookQuery({
          providerId,
          startTime,
          endTime,
          isConsultation,
        })
      ),
    ]);

    await this.appointmentCheckerService.assertNoConflict({
      providerId,
      startTime,
      endTime,
    });

    // Klinik ayarı sekreter onayı gerektiriyorsa randevu PENDING kalır; gerektirmiyorsa
    // doğrudan CONFIRMED doğar.
    const status = settings.requireConfirmation
      ? AppointmentStatusSchema.enum.PENDING
      : AppointmentStatusSchema.enum.CONFIRMED;

    const appointment = Appointment.book({
      patientId: patient.patientId,
      patientName: patient.firstName,
      patientPhone: patient.phone,
      patientEmail: patient.email,
      providerId,
      clinicId,
      treatmentId,
      startTime,
      endTime,
      notes,
      timezone: data.timezone ?? TimeZoneSchema.enum.Europe_Istanbul,
      isConsultation,
      status,
      // Hasta kendi aldığı için kaynak/oluşturan hasta olarak işaretlenir.
      source: AppointmentSourceSchema.enum.PATIENT_PORTAL,
      creatorType: AppointmentCreatorTypeSchema.enum.PATIENT,
      createdById: patient.patientId,
      createdByRealName: patient.firstName,
    });

    return this.transactionManager.run(async () => {
      const saved = await this.appointmentRepo.create(appointment);
      return saved.id.value;
    });
  }
}
